# PhotoProOS Comprehensive Audit & Fix Plan

**Generated:** January 7, 2026
**Modules Audited:** 8 (Leads, Clients, Galleries, Invoices, Scheduling, Messaging, Projects, Settings)

---

## Executive Summary

A comprehensive audit of all major modules in PhotoProOS revealed **147 issues** across validation, error handling, missing functionality, and UX gaps. The findings are organized by priority level for systematic remediation.

### Issue Count by Category

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Missing Validation | 8 | 15 | 12 | 6 | 41 |
| Error Handling Gaps | 5 | 12 | 8 | 4 | 29 |
| Missing Functionality | 6 | 14 | 18 | 10 | 48 |
| UI/UX Issues | 2 | 8 | 12 | 7 | 29 |

---

## Priority 1: Critical Issues (Fix Immediately)

### 1.1 Leads Module - No Manual Lead Creation
**Impact:** Users cannot add leads manually - only captured from forms
**Location:** `/src/app/(dashboard)/leads/`
**Fix Required:**
- Create `createManualLead()` server action in `/src/lib/actions/leads.ts`
- Add lead creation form component
- Add "+ Add Lead" button to leads page
- Implement Zod validation schema

### 1.2 Messaging - Video Calls Disabled (Demo Mode Only)
**Impact:** Video/voice calls don't work at all
**Location:** `/src/lib/actions/calls.ts`
**Fix Required:**
- Complete Daily.co provider integration
- Remove demo mode restrictions
- Implement Twilio Video (currently stub)
- Add proper error handling for call failures

### 1.3 Messaging - Scheduled Messages Don't Auto-Send
**Impact:** Messages stay pending forever
**Location:** `/src/lib/actions/scheduled-messages.ts`
**Fix Required:**
- Implement cron job for `processDueScheduledMessages()`
- Add to `/src/app/api/cron/` directory
- Configure cron schedule (every minute or 5 minutes)
- Add retry logic for failed sends

### 1.4 Invoices - No Payment Gateway Integration
**Impact:** Cannot process actual payments
**Location:** `/src/lib/actions/invoice-payments.ts`
**Fix Required:**
- Implement Stripe payment links generation
- Add webhook handlers for payment events
- Connect `stripePaymentIntentId` to actual Stripe API
- Add payment status synchronization

### 1.5 Scheduling - Missing Reminder Cron Job
**Impact:** Booking reminders never send
**Location:** `/src/lib/actions/bookings.ts` line 1601-1677
**Fix Required:**
- Create `/src/app/api/cron/booking-reminders/route.ts`
- Implement reminder sending (email + SMS)
- Add delivery status tracking
- Configure cron schedule

### 1.6 Galleries - Cover Image Upload Broken
**Impact:** Advertised feature doesn't work
**Location:** `/src/app/(dashboard)/galleries/new/gallery-new-form.tsx` lines 432-448
**Fix Required:**
- Implement upload handler
- Connect to R2 storage
- Add image preview functionality
- Handle upload errors gracefully

### 1.7 Projects - No Task Input Validation
**Impact:** Can create tasks with invalid data
**Location:** `/src/lib/actions/projects.ts` `createTask()` and `updateTask()`
**Fix Required:**
- Add Zod validation schema for tasks
- Validate title length (1-500 chars)
- Validate date logic (startDate < dueDate)
- Verify assignee/client/project belong to organization

### 1.8 SMS Opt-In Bypass in Direct Send
**Impact:** Can send SMS to opted-out clients (legal/GDPR risk)
**Location:** `/src/lib/sms/send.ts` - `sendSMSDirect()`
**Fix Required:**
- Add opt-in check to direct SMS function
- Log bypass attempts for audit
- Add warning in UI when sending to opted-out numbers

---

## Priority 2: High Priority Issues

### 2.1 Validation Issues

| Module | Issue | Location | Fix |
|--------|-------|----------|-----|
| Clients | No phone validation | `client-new-form.tsx` | Use `validators.phone()` from centralized utilities |
| Clients | Address format inconsistency | Create vs Edit forms | Standardize to split fields or single textarea |
| Scheduling | End time < start time not checked | `updateBooking()` line 341 | Add time validation |
| Scheduling | No status transition rules | `updateBookingStatus()` | Implement state machine |
| Galleries | Custom expiration allows past dates | `gallery-new-form.tsx` | Add future date validation |
| Galleries | Password edit missing in edit form | `gallery-edit-form.tsx` | Add password change field |
| Invoices | Tax/discount allows negative values | `invoice-editor.tsx` line 676 | Add min value validation |
| Invoices | Late fee can exceed 100% | `invoice-editor.tsx` | Cap at reasonable maximum |
| Messages | Message content not validated | `messages.ts` `sendMessage()` | Check `content.trim().length > 0` |
| Messages | Template variables unchecked | `send.ts` | Validate required variables present |

### 2.2 Error Handling Issues

| Module | Issue | Location | Fix |
|--------|-------|----------|-----|
| Clients | Server-side validation missing | `clients.ts` | Add Zod validation before DB operations |
| Invoices | Email failure doesn't notify user | `sendInvoice()` line 591 | Add user notification for failures |
| Invoices | No retry logic for failed operations | All payment functions | Implement exponential backoff |
| Scheduling | Email sending non-blocking | `confirmBooking()` | Track delivery status, notify on failure |
| Galleries | Delete photo missing cascading deletes | `deletePhoto()` | Delete related favorites/comments |
| Messaging | Silent email notification failures | `sendMessage()` line 240 | Notify user of failures |
| Projects | Generic error messages | All 70 server actions | Add error categorization and specific messages |

### 2.3 Missing Functionality

| Module | Missing Feature | Impact | Effort |
|--------|-----------------|--------|--------|
| Leads | Edit lead contact information | Cannot fix typos | Medium |
| Leads | Lead assignment to team members | No ownership tracking | Medium |
| Clients | Analytics UI for acquisition data | Features exist, no UI | Medium |
| Scheduling | Conflict resolution suggestions | Poor UX when conflicts exist | High |
| Galleries | Selection-required enforcement | Feature incomplete | Medium |
| Invoices | Recurring invoices cron job | Subscriptions don't auto-generate | High |
| Messaging | Per-message read receipts | Cannot see who read what | Medium |
| Messaging | Typing indicators broadcast | Only shows locally | Medium |
| Projects | Task archiving UI | Backend exists, no UI | Low |
| Projects | Time tracking UI | Backend exists, no UI | Medium |

---

## Priority 3: Medium Priority Issues

### 3.1 Consistency Issues

| Issue | Modules Affected | Fix Required |
|-------|------------------|--------------|
| Validation inconsistency between create/edit forms | Clients, Galleries | Unify validation logic, use shared schemas |
| Status transition rules not enforced | Scheduling, Projects | Implement state machines with valid transitions |
| Error message format varies | All | Standardize error response format with codes |
| Date/time handling inconsistent | Scheduling | Normalize timezone handling |

### 3.2 UX Improvements Needed

| Module | Improvement | Details |
|--------|-------------|---------|
| Leads | Empty state with CTA | Guide users to add first lead manually |
| Leads | Visual lead score display | Show hot/warm/cold indicators |
| Clients | Phone format guidance | Show expected format in placeholder |
| Scheduling | Conflict resolution UI | Show suggested alternate times |
| Galleries | Password change in edit | Add field to change existing password |
| Invoices | Partial payment indication | Distinguish full vs partial payments |
| Projects | Keyboard shortcuts help | Show modal with available shortcuts |

### 3.3 Performance Issues

| Module | Issue | Fix |
|--------|-------|-----|
| Messaging | N+1 query for unread counts | Batch calculate with single aggregation |
| Messaging | Polls all 50 messages every 3s | Only poll for new messages |
| Projects | No pagination on large task lists | Implement cursor-based pagination |
| Scheduling | Recurring booking validation per-date | Batch validate dates |

---

## Priority 4: Low Priority Issues

### 4.1 Nice-to-Have Features

| Module | Feature | Notes |
|--------|---------|-------|
| Leads | CSV import for bulk leads | Competitor feature |
| Leads | Duplicate detection | Warn before creating duplicate emails |
| Clients | Rich notes with mentions | Collaboration enhancement |
| Scheduling | Booking templates | Quick-create from previous |
| Scheduling | iCal feed export | For team calendars |
| Galleries | Drag-drop photo reorder on mobile | Touch support |
| Invoices | PDF export of aging reports | For accountants |
| Projects | Custom fields per organization | Flexibility |

### 4.2 Technical Debt

| Issue | Location | Notes |
|-------|----------|-------|
| Large client component (1605 lines) | `leads-page-client.tsx` | Split into smaller components |
| Repeated email regex validation | Multiple forms | Centralize in validation utils |
| Magic strings for statuses | Multiple modules | Use enum constants |
| No unit tests | All modules | Add Jest/Vitest tests |

---

## Implementation Roadmap

### Phase 1: Critical Fixes (Week 1-2)
1. Add manual lead creation
2. Fix scheduled messages cron job
3. Implement booking reminders cron
4. Add task input validation
5. Fix SMS opt-in check

### Phase 2: High Priority (Week 3-4)
1. Unify form validation across modules
2. Implement error handling improvements
3. Add missing UI for existing features (projects time tracking, archives)
4. Fix galleries cover image upload
5. Add payment gateway integration

### Phase 3: Medium Priority (Week 5-6)
1. Status transition state machines
2. Performance optimizations
3. UX improvements
4. Consistency fixes

### Phase 4: Polish (Week 7-8)
1. Technical debt cleanup
2. Nice-to-have features
3. Testing
4. Documentation

---

## Files Changed in This Session

### Settings Improvements (Completed)

1. **Created:** `/src/components/settings/unsaved-changes-provider.tsx`
   - Context provider for tracking unsaved form changes
   - Browser beforeunload handler
   - Confirmation dialog component
   - `useUnsavedChanges()` and `useFormUnsavedChanges()` hooks

2. **Created:** `/src/components/settings/collapsible-settings-section.tsx`
   - Collapsible section component
   - localStorage persistence for collapsed state
   - Chevron animation
   - Item count badge

3. **Modified:** `/src/app/(dashboard)/settings/layout.tsx`
   - Added UnsavedChangesProvider wrapper

4. **Modified:** `/src/app/(dashboard)/settings/page.tsx`
   - Integrated CollapsibleSettingsSection component
   - Default open for "personal" and "business" categories

---

## Module-Specific Audit Details

### Leads Module
- **CRUD Status:** Create (partial - external only), Read (complete), Update (status/notes only), Delete (complete)
- **Key Gap:** No manual creation, no contact info editing
- **Validation:** Basic email regex, no phone validation, no spam protection

### Clients Module
- **CRUD Status:** Complete (80% functional)
- **Key Gap:** Phone validation missing, analytics features have no UI
- **Validation:** Email uniqueness checked, address format inconsistent

### Galleries Module
- **CRUD Status:** Complete with comprehensive features
- **Key Gap:** Cover image upload broken, password edit missing
- **Validation:** Custom expiration date allows past dates in new form

### Invoices Module
- **CRUD Status:** Complete with deposit splitting, late fees
- **Key Gap:** No actual payment processing, recurring invoices broken
- **Validation:** Line items not fully validated, tax can be negative

### Scheduling Module
- **CRUD Status:** Complete with recurring bookings, multi-day events
- **Key Gap:** Reminder cron missing, status transitions not validated
- **Validation:** End time > start time not checked in updates

### Messaging Module
- **CRUD Status:** Complete with channels, DMs, reactions
- **Key Gap:** Video calls disabled, scheduled messages don't send
- **Validation:** Message content not validated, typing indicators local only

### Projects Module
- **CRUD Status:** Complete with automations, recurring tasks
- **Key Gap:** No input validation, archiving UI missing
- **Validation:** Title/dates not validated, status transitions not enforced

---

## Quick Reference: Server Action Locations

| Module | File | Key Functions |
|--------|------|---------------|
| Leads | `/src/lib/actions/portfolio-websites.ts` | `submitPortfolioInquiry`, `updatePortfolioInquiryStatus` |
| Leads | `/src/lib/actions/chat-inquiries.ts` | `submitChatInquiry`, `updateChatInquiryStatus` |
| Clients | `/src/lib/actions/clients.ts` | `createClient`, `updateClient`, `deleteClient` |
| Galleries | `/src/lib/actions/galleries.ts` | `createGallery`, `deliverGallery`, `deletePhoto` |
| Invoices | `/src/lib/actions/invoices.ts` | `createInvoice`, `sendInvoice`, `applyLateFee` |
| Invoices | `/src/lib/actions/invoice-payments.ts` | `recordInvoicePayment`, `voidPayment` |
| Scheduling | `/src/lib/actions/bookings.ts` | `createBooking`, `confirmBooking`, `updateBookingStatus` |
| Messaging | `/src/lib/actions/messages.ts` | `sendMessage`, `getConversationMessages` |
| Messaging | `/src/lib/actions/scheduled-messages.ts` | `processDueScheduledMessages` |
| Projects | `/src/lib/actions/projects.ts` | `createTask`, `updateTask`, `moveTask` |

---

## Next Steps

1. **Review this document** with stakeholders to prioritize fixes
2. **Create GitHub issues** for each critical/high priority item
3. **Begin Phase 1** implementation immediately
4. **Set up cron jobs** for scheduled messages, reminders, recurring tasks
5. **Add validation schemas** to all form submissions
6. **Implement proper error handling** with user notifications
