import { prisma } from '../db';

export async function nextEmployeeId(schoolId: string): Promise<string> {
  const last = await prisma.teacher.findFirst({
    where: { schoolId },
    orderBy: { employeeId: 'desc' },
    select: { employeeId: true },
  });
  const n = last ? parseInt(last.employeeId.replace('EMP-', ''), 10) || 0 : 0;
  return `EMP-${String(n + 1).padStart(3, '0')}`;
}

export async function nextEnrollmentId(schoolId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `MON-${year}-`;
  const last = await prisma.student.findFirst({
    where: { schoolId, enrollmentId: { startsWith: prefix } },
    orderBy: { enrollmentId: 'desc' },
    select: { enrollmentId: true },
  });
  const n = last ? parseInt(last.enrollmentId.replace(prefix, ''), 10) || 0 : 0;
  return `${prefix}${String(n + 1).padStart(3, '0')}`;
}

export async function nextRollNo(schoolId: string, cls: string): Promise<string> {
  const count = await prisma.student.count({ where: { schoolId, class: cls } });
  return String(count + 1).padStart(2, '0');
}

export async function nextReceiptNo(schoolId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RCPT-${year}-`;
  const last = await prisma.payment.findFirst({
    where: { schoolId, receiptNo: { startsWith: prefix } },
    orderBy: { receiptNo: 'desc' },
    select: { receiptNo: true },
  });
  const n = last ? parseInt(last.receiptNo.replace(prefix, ''), 10) || 0 : 0;
  return `${prefix}${String(n + 1).padStart(4, '0')}`;
}

export function slugEmail(name: string, domain: string): string {
  const local = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return `${local}@${domain}`;
}
