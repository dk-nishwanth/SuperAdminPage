/* Mock API layer for Super Admin Dashboard */
import { addDays, formatISO, subDays } from 'date-fns'

export type Role = 'student' | 'teacher' | 'admin' | 'super_admin'
export interface User { id: string; name: string; email: string; role: Role; lastLoginAt: string; createdAt: string; isActive: boolean; avatarUrl?: string }
export interface StudentProgressTopicMap { Arrays: number; Strings: number; Trees: number; Graphs: number; DP: number; Searching: number; Sorting: number }
export interface StudentProgress {
  userId: string;
  progressPct: number;
  topics: StudentProgressTopicMap;
  completedTests: Array<{ id: string; title: string; scorePct: number; date: string }>;
  certification: { status: 'Not Started' | 'In Progress' | 'Certified'; issuedOn?: string };
}
export interface Subscription { id: string; userId: string; plan: 'free' | 'premium_monthly' | 'premium_yearly'; status: 'active' | 'canceled' | 'past_due'; startDate: string; endDate?: string }
export interface Transaction { id: string; userId: string; name: string; email: string; status: 'success' | 'failed'; amountInINR: number; date: string }
export interface Teacher { id: string; name: string; email: string; assignedStudentsCount: number; lastActivityAt: string }
export interface RevenueSummary { monthlyRevenueINR: number; lifetimeRevenueINR: number; activeSubscriptions: number; failedPayments: number }
export interface GrowthPoint { date: string; studentsTotal: number }
export interface TopicPopularity { topic: string; count: number }
export interface RevenuePoint { date: string; revenueINR: number }

// Simple deterministic pseudo-random with seed
let seed = 42
function srand() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }
function pick<T>(arr: T[]): T { return arr[Math.floor(srand() * arr.length)] }
function randint(min: number, max: number) { return Math.floor(srand() * (max - min + 1)) + min }
function nameGen(i: number) { const first = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Krishna','Ishaan','Rohan','Dhruv','Ananya','Aditi','Diya','Isha','Kavya','Myra','Sara','Meera','Anika','Navya']; const last = ['Sharma','Verma','Gupta','Mehta','Patel','Reddy','Iyer','Nair','Khan','Singh']; return `${pick(first)} ${pick(last)} ${i}` }
function emailGen(name: string) { return name.toLowerCase().replace(/\s+/g,'_') + '@example.com' }

// Build dataset
const today = new Date()
const users: User[] = []
const students: string[] = []
const teachersArr: Teacher[] = []
const subscriptions: Subscription[] = []
const transactions: Transaction[] = []
const progressMap = new Map<string, StudentProgress>()

for (let i = 1; i <= 90; i++) {
  const role: Role = i % 15 === 0 ? 'teacher' : 'student'
  const name = nameGen(i)
  const u: User = {
    id: `u_${i}`,
    name,
    email: emailGen(name),
    role,
    lastLoginAt: formatISO(subDays(today, randint(0, 15))),
    createdAt: formatISO(subDays(today, randint(30, 365))),
    isActive: srand() > 0.1,
    avatarUrl: undefined,
  }
  users.push(u)
  if (role === 'student') students.push(u.id)
  if (role === 'teacher') {
    const t: Teacher = {
      id: u.id,
      name: u.name,
      email: u.email,
      assignedStudentsCount: randint(5, 40),
      lastActivityAt: formatISO(subDays(today, randint(0, 10)))
    }
    teachersArr.push(t)
  }
  // subscriptions for students
  if (role === 'student') {
    const plan = pick(['free','premium_monthly','premium_yearly'] as const)
    const status = plan === 'free' ? 'canceled' : pick(['active','past_due','canceled'] as const)
    const start = subDays(today, randint(0, 300))
    const sub: Subscription = { id: `s_${i}`, userId: u.id, plan, status, startDate: formatISO(start), endDate: status !== 'active' ? formatISO(addDays(start, randint(30, 365))) : undefined }
    subscriptions.push(sub)
  }
  // student progress
  if (role === 'student') {
    const topics = { Arrays: randint(0, 100), Strings: randint(0, 100), Trees: randint(0, 100), Graphs: randint(0, 100), DP: randint(0, 100), Searching: randint(0, 100), Sorting: randint(0, 100) }
    const progressPct = Math.round(Object.values(topics).reduce((a,b)=>a+b,0)/7)
    const tests = Array.from({ length: randint(1,6) }).map((_,k)=>({ id: `t_${i}_${k}`, title: `Mock Test ${k+1}`, scorePct: randint(35,100), date: formatISO(subDays(today, randint(1,120))) }))
    const status = pick(['Not Started','In Progress','Certified'] as const)
    const certification = status === 'Certified' ? { status, issuedOn: formatISO(subDays(today, randint(1, 120))) } : { status }
    progressMap.set(u.id, { userId: u.id, progressPct, topics, completedTests: tests, certification })
  }
}

for (let i = 1; i <= 140; i++) {
  const uid = pick(students)
  const u = users.find(x=>x.id===uid)!
  const status = srand() > 0.2 ? 'success' : 'failed'
  const amount = pick([499, 999, 1999, 2999, 4999])
  transactions.push({ id: `tx_${i}`, userId: uid, name: u.name, email: u.email, status, amountInINR: amount, date: formatISO(subDays(today, randint(0, 120))) })
}

export interface PageParams { page: number; pageSize: number }

function delay<T>(data: T, ms = 400): Promise<T> { return new Promise(res => setTimeout(()=>res(data), ms)) }

export async function getUsers(params: PageParams & { search?: string; role?: Role | 'all'; status?: 'active' | 'suspended' | 'all'; sort?: { id: string; desc?: boolean }[] }) {
  const { page, pageSize, search, role, status, sort } = params
  let list = users.slice()
  if (search) { const q = search.toLowerCase(); list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) }
  if (role && role !== 'all') list = list.filter(u => u.role === role)
  if (status && status !== 'all') list = list.filter(u => (status === 'active' ? u.isActive : !u.isActive))
  if (sort && sort.length) {
    for (const s of sort) {
      list.sort((a:any,b:any)=>{
        const dir = s.desc ? -1 : 1
        if (s.id === 'name' || s.id==='email' || s.id==='role') return a[s.id].localeCompare(b[s.id]) * dir
        if (s.id === 'lastLoginAt') return (a.lastLoginAt > b.lastLoginAt ? 1 : -1) * dir
        return 0
      })
    }
  }
  const total = list.length
  const start = (page - 1) * pageSize
  const pageItems = list.slice(start, start + pageSize)
  const studentsProgress = pageItems.map(u => ({ userId: u.id, progress: u.role==='student' ? progressMap.get(u.id)?.progressPct ?? 0 : null }))
  return delay({ items: pageItems, total, studentsProgress })
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const u = users.find(x=>x.id===userId)
  if (u) u.isActive = isActive
  return delay({ success: true })
}

export async function getStudentProgressSummary({ dateRange }: { dateRange: { from: string; to: string } }) {
  const relevant = users.filter(u=>u.role==='student')
  const total = relevant.length
  const avg = Math.round(relevant.reduce((acc,u)=>acc + (progressMap.get(u.id)?.progressPct ?? 0),0) / total)
  const activeToday = relevant.filter(u=>new Date(u.lastLoginAt) >= subDays(new Date(dateRange.to), 0)).length
  return delay({ totalStudents: total, averageCompletion: avg, activeToday })
}

export async function getStudentProfile(userId: string) {
  const user = users.find(u=>u.id===userId)
  if (!user) throw new Error('Not found')
  const progress = progressMap.get(userId)!
  const sub = subscriptions.find(s=>s.userId===userId)
  return delay({ user, progress, subscription: sub })
}

export async function getRevenueOverview({ dateRange }: { dateRange: { from: string; to: string } }): Promise<RevenueSummary> {
  const tx = transactions.filter(t=> new Date(t.date)>= new Date(dateRange.from) && new Date(t.date)<= new Date(dateRange.to))
  const monthly = tx.filter(t=>new Date(t.date) >= subDays(new Date(dateRange.to), 30) && t.status==='success').reduce((a,b)=>a+b.amountInINR,0)
  const lifetime = transactions.filter(t=>t.status==='success').reduce((a,b)=>a+b.amountInINR,0)
  const activeSubs = subscriptions.filter(s=>s.status==='active').length
  const failed = tx.filter(t=>t.status==='failed').length
  return delay({ monthlyRevenueINR: monthly, lifetimeRevenueINR: lifetime, activeSubscriptions: activeSubs, failedPayments: failed })
}

export async function getRecentTransactions(params: PageParams & { search?: string; status?: 'all'|'success'|'failed'; minAmount?: number; maxAmount?: number; dateRange?: { from: string; to: string } }) {
  let list = transactions.slice()
  const { page, pageSize, search, status, minAmount, maxAmount, dateRange } = params
  if (search) { const q = search.toLowerCase(); list = list.filter(t=> t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)) }
  if (status && status!=='all') list = list.filter(t=>t.status===status)
  if (typeof minAmount==='number') list = list.filter(t=>t.amountInINR >= minAmount)
  if (typeof maxAmount==='number') list = list.filter(t=>t.amountInINR <= maxAmount)
  if (dateRange) list = list.filter(t=> new Date(t.date)>= new Date(dateRange.from) && new Date(t.date)<= new Date(dateRange.to))
  const total = list.length
  const start = (page-1)*pageSize
  return delay({ items: list.slice(start, start+pageSize), total })
}

export async function getTeachers(params: PageParams & { search?: string }) {
  let list = teachersArr.slice()
  if (params.search) { const q = params.search.toLowerCase(); list = list.filter(t=> t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)) }
  const total = list.length
  const start = (params.page-1)*params.pageSize
  return delay({ items: list.slice(start, start+params.pageSize), total })
}

export async function getTeacherActivityLogs(teacherId: string) {
  const logs = Array.from({ length: randint(5, 15) }).map((_,i)=> ({ id: `log_${teacherId}_${i}`, text: `Viewed student u_${randint(1,90)} progress`, at: formatISO(subDays(today, randint(0, 20))) }))
  return delay({ items: logs })
}

export async function getAnalytics({ dateRange }: { dateRange: { from: string; to: string } }): Promise<{ growth: GrowthPoint[]; topicPopularity: TopicPopularity[]; revenueTrend: RevenuePoint[] }> {
  const days = 30
  const base = subDays(new Date(dateRange.to), days)
  const growth: GrowthPoint[] = Array.from({ length: days+1 }).map((_,i)=> ({ date: formatISO(addDays(base, i)), studentsTotal: 1000 + i*randint(5,15) }))
  const topicPopularity: TopicPopularity[] = [ 'Arrays','Strings','Trees','Graphs','DP','Searching','Sorting' ].map(topic => ({ topic, count: randint(50, 300) }))
  const revenueTrend: RevenuePoint[] = Array.from({ length: days+1 }).map((_,i)=> ({ date: formatISO(addDays(base, i)), revenueINR: randint(1000, 20000) }))
  return delay({ growth, topicPopularity, revenueTrend })
}
