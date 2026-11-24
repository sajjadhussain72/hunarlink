import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const customerProfile = pgTable(
  "customer_profile",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().unique(),
    address: text("address"),
    districtId: uuid("district_id"),
    cityTownId: uuid("city_town_id"),
    areaId: uuid("area_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("customer_profile_user_id_idx").on(table.userId),
  }),
);
export const professionalProfile = pgTable(
  "professional_profile",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().unique(),
    profession: text("profession").notNull(),
    bio: text("bio"),
    experienceYears: integer("experience_years").notNull().default(0),
    status: text("status").notNull().default("PENDING"),
    verificationStatus: text("verification_status")
      .notNull()
      .default("PENDING"),
    availabilityStatus: text("availability_status")
      .notNull()
      .default("OFFLINE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("professional_profile_user_id_idx").on(table.userId),
    statusIdx: index("professional_profile_status_idx").on(table.status),
  }),
);
export const serviceRequest = pgTable(
  "service_request",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: text("customer_id").notNull(),
    categoryId: uuid("category_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    urgency: text("urgency").notNull().default("NORMAL"),
    districtId: uuid("district_id"),
    cityTownId: uuid("city_town_id"),
    areaId: uuid("area_id"),
    locationId: uuid("location_id"),
    address: text("address").notNull(),
    preferredDate: timestamp("preferred_date"),
    preferredTime: text("preferred_time"),
    status: text("status").notNull().default("REQUESTED"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    customerIdIdx: index("service_request_customer_id_idx").on(
      table.customerId,
    ),
    statusIdx: index("service_request_status_idx").on(table.status),
  }),
);
export const serviceStatusHistory = pgTable("service_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceRequestId: uuid("service_request_id").notNull(),
  previousStatus: text("previous_status"),
  newStatus: text("new_status").notNull(),
  changedBy: text("changed_by").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const notification = pgTable(
  "notification",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("notification_user_id_idx").on(table.userId),
    readIdx: index("notification_read_idx").on(table.read),
  }),
);
export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: text("actor_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const managedConversation = pgTable(
  "managed_conversation",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: text("customer_id").notNull(),
    serviceRequestId: uuid("service_request_id"),
    subject: text("subject").notNull().default("HunarLink Support"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    customerIdIdx: index("managed_conversation_customer_id_idx").on(
      table.customerId,
    ),
  }),
);
export const managedMessage = pgTable(
  "managed_message",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id").notNull(),
    senderId: text("sender_id").notNull(),
    senderRole: text("sender_role").notNull().default("CUSTOMER"),
    body: text("body").notNull(),
    messageType: text("message_type").notNull().default("TEXT"),
    audioPath: text("audio_path"),
    durationSeconds: integer("duration_seconds"),
    deletedForCustomer: boolean("deleted_for_customer")
      .notNull()
      .default(false),
    deletedForStaff: boolean("deleted_for_staff").notNull().default(false),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    conversationIdIdx: index("managed_message_conversation_id_idx").on(
      table.conversationId,
    ),
    audioPathIdx: index("managed_message_audio_path_idx").on(table.audioPath),
  }),
);
export const completedProject = pgTable("completed_project", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id").notNull().unique(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  serviceCategory: text("service_category").notNull(),
  locationId: uuid("location_id"),
  projectType: text("project_type").notNull(),
  clientType: text("client_type").notNull(),
  clientName: text("client_name"),
  clientLogo: text("client_logo"),
  clientWebsite: text("client_website"),
  displayClientPublicly: boolean("display_client_publicly")
    .notNull()
    .default(false),
  overview: text("overview").notNull().default(""),
  clientRequirement: text("client_requirement").notNull().default(""),
  workPerformed: text("work_performed").notNull().default(""),
  challenges: text("challenges"),
  solution: text("solution").notNull().default(""),
  result: text("result").notNull().default(""),
  startDate: date("start_date"),
  completionDate: date("completion_date"),
  serviceRequestId: uuid("service_request_id"),
  completedBy: text("completed_by"),
  internalNotes: text("internal_notes"),
  featured: boolean("featured").notNull().default(false),
  status: text("status").notNull().default("DRAFT"),
  clientPermissionStatus: text("client_permission_status")
    .notNull()
    .default("NOT_REQUESTED"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});
export const completedProjectImage = pgTable("completed_project_image", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  imageUrl: text("image_url").notNull(),
  imageType: text("image_type").notNull().default("GALLERY"),
  caption: text("caption"),
  altText: text("alt_text").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const completedProjectTestimonial = pgTable(
  "completed_project_testimonial",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull(),
    testimonial: text("testimonial").notNull(),
    clientName: text("client_name"),
    companyName: text("company_name"),
    position: text("position"),
    photoUrl: text("photo_url"),
    permissionStatus: text("permission_status")
      .notNull()
      .default("NOT_REQUESTED"),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);
export const supportTicket = pgTable("support_ticket", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: text("customer_id").notNull(),
  serviceRequestId: uuid("service_request_id"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  priority: text("priority").notNull().default("NORMAL"),
  status: text("status").notNull().default("OPEN"),
  assignedStaff: text("assigned_staff"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const pricing = pgTable("pricing", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").notNull(),
  name: text("name").notNull(),
  pricingType: text("pricing_type").notNull(),
  amount: integer("amount"),
  description: text("description"),
  active: boolean("active").notNull().default(true),
});
export const payment = pgTable("payment", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceRequestId: uuid("service_request_id").notNull(),
  customerId: text("customer_id").notNull(),
  amount: integer("amount").notNull(),
  method: text("method").notNull(),
  status: text("status").notNull().default("UNPAID"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const invoice = pgTable("invoice", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceRequestId: uuid("service_request_id").notNull().unique(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: text("customer_id").notNull(),
  subtotal: integer("subtotal").notNull(),
  additionalCharges: integer("additional_charges").notNull().default(0),
  total: integer("total").notNull(),
  paymentStatus: text("payment_status").notNull().default("UNPAID"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const serviceAssignment = pgTable(
  "service_assignment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceRequestId: uuid("service_request_id").notNull(),
    professionalId: uuid("professional_id").notNull(),
    assignedBy: text("assigned_by").notNull(),
    status: text("status").notNull().default("ASSIGNED"),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
    respondedAt: timestamp("responded_at"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    scheduledDate: date("scheduled_date"),
    scheduledTime: text("scheduled_time"),
    notes: text("notes"),
    priority: text("priority").notNull().default("NORMAL"),
  },
  (table) => ({
    serviceRequestIdIdx: index("service_assignment_service_request_id_idx").on(
      table.serviceRequestId,
    ),
    professionalIdIdx: index("service_assignment_professional_id_idx").on(
      table.professionalId,
    ),
    statusIdx: index("service_assignment_status_idx").on(table.status),
  }),
);
export const serviceCategory = pgTable("service_category", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  active: boolean("active").notNull().default(true),
});
export const serviceAttachment = pgTable("service_attachment", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceRequestId: uuid("service_request_id").notNull(),
  url: text("url").notNull(),
  fileName: text("file_name"),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const serviceStatuses = [
  "REQUESTED",
  "UNDER_REVIEW",
  "ASSIGNING",
  "ASSIGNED",
  "CONFIRMED",
  "PROFESSIONAL_ON_THE_WAY",
  "SERVICE_STARTED",
  "SERVICE_COMPLETED",
  "CUSTOMER_CONFIRMED",
  "CLOSED",
  "CANCELLED",
  "RESCHEDULED",
  "DISPUTED",
  "REQUIRES_FOLLOW_UP",
] as const;
export type ServiceStatus = (typeof serviceStatuses)[number];

export const assignmentStatuses = [
  "ASSIGNED",
  "ACCEPTED",
  "REJECTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type AssignmentStatus = (typeof assignmentStatuses)[number];

export const assignmentPriorities = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
] as const;
export type AssignmentPriority = (typeof assignmentPriorities)[number];
