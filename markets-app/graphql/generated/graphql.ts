/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AddScheduleInput = {
  dayOfWeek?: InputMaybe<Scalars['Int']['input']>;
  endTime: Scalars['String']['input'];
  eventDate?: InputMaybe<Scalars['String']['input']>;
  eventName?: InputMaybe<Scalars['String']['input']>;
  frequency?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  marketID: Scalars['ID']['input'];
  scheduleType: ScheduleType;
  seasonEnd?: InputMaybe<Scalars['String']['input']>;
  seasonStart?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['String']['input'];
};

export type AuditLogConnection = {
  __typename?: 'AuditLogConnection';
  entries: Array<AuditLogEntry>;
  hasMore: Scalars['Boolean']['output'];
  totalCount: Scalars['Int']['output'];
};

/**
 * Audit log query types (read-only, no mutations).
 * Audit writes are handled exclusively by PostgreSQL triggers.
 */
export type AuditLogEntry = {
  __typename?: 'AuditLogEntry';
  actionType: Scalars['String']['output'];
  actorID: Scalars['String']['output'];
  actorRole: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  marketID?: Maybe<Scalars['String']['output']>;
  payload?: Maybe<Scalars['String']['output']>;
  targetID: Scalars['String']['output'];
  targetType: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
};

export type AuditLogFilter = {
  actionType?: InputMaybe<Scalars['String']['input']>;
  actorID?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  marketID?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  targetID?: InputMaybe<Scalars['String']['input']>;
  targetType?: InputMaybe<Scalars['String']['input']>;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type CancellationReason =
  | 'EMERGENCY'
  | 'LOW_ATTENDANCE'
  | 'OTHER'
  | 'WEATHER';

export type CheckIn = {
  __typename?: 'CheckIn';
  checkedInAt: Scalars['String']['output'];
  checkedOutAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  marketID: Scalars['ID']['output'];
  status: CheckInStatus;
  vendorID: Scalars['ID']['output'];
};

export type CheckInInput = {
  marketID: Scalars['ID']['input'];
};

export type CheckInStatus =
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'EXCEPTION';

export type CreateMarketInput = {
  address: Scalars['String']['input'];
  contactEmail: Scalars['String']['input'];
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageURL?: InputMaybe<Scalars['String']['input']>;
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  /** Recovery contact for the creating manager (email or phone). Required per FR41b. */
  recoveryContact: Scalars['String']['input'];
  socialLinks?: InputMaybe<SocialLinksInput>;
};

export type CreateProductInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageURL?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateUserInput = {
  name: Scalars['String']['input'];
  role: Role;
};

export type CreateUserPayload = {
  __typename?: 'CreateUserPayload';
  user: User;
};

export type CreateVendorProfileInput = {
  businessName: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  imageURL?: InputMaybe<Scalars['String']['input']>;
};

/** Customer profile, follows, and discovery queries. */
export type CustomerProfile = {
  __typename?: 'CustomerProfile';
  createdAt: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  followedMarkets: Array<Market>;
  followedVendors: Array<Vendor>;
  id: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
  userID: Scalars['ID']['output'];
};

export type DeviceToken = {
  __typename?: 'DeviceToken';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  platform: Platform;
  token: Scalars['String']['output'];
  userID: Scalars['ID']['output'];
};

export type ExceptionStatusInput = {
  checkInID: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};

export type Follow = {
  __typename?: 'Follow';
  createdAt: Scalars['String']['output'];
  customerID: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  targetID: Scalars['ID']['output'];
  targetType: FollowTargetType;
};

export type FollowTargetType =
  | 'MARKET'
  | 'VENDOR';

export type FollowingFeedItem = {
  __typename?: 'FollowingFeedItem';
  id: Scalars['ID']['output'];
  market?: Maybe<Market>;
  message: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
  type: Scalars['String']['output'];
  vendor?: Maybe<Vendor>;
};

export type InvitationStatus =
  | 'ACCEPTED'
  | 'DECLINED'
  | 'PENDING';

export type LoginInput = {
  firebaseToken: Scalars['String']['input'];
};

/**
 * Market profile, schedule, and roster types.
 * Managed by Market Managers.
 */
export type Market = {
  __typename?: 'Market';
  address: Scalars['String']['output'];
  cancellationMessage?: Maybe<Scalars['String']['output']>;
  cancellationReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['String']['output']>;
  contactEmail: Scalars['String']['output'];
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageURL?: Maybe<Scalars['String']['output']>;
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  managers: Array<User>;
  name: Scalars['String']['output'];
  rulesText?: Maybe<Scalars['String']['output']>;
  rulesUpdatedAt?: Maybe<Scalars['String']['output']>;
  schedule: Array<MarketSchedule>;
  socialLinks?: Maybe<SocialLinks>;
  status: MarketStatus;
  updatedAt: Scalars['String']['output'];
  vendors: Array<VendorRosterEntry>;
};

/** Planning view for a future market date. */
export type MarketDayPlan = {
  __typename?: 'MarketDayPlan';
  committedVendors: Array<VendorRosterEntry>;
  date: Scalars['String']['output'];
  pendingRequests: Array<VendorRosterEntry>;
  vendorCount: Scalars['Int']['output'];
};

export type MarketSchedule = {
  __typename?: 'MarketSchedule';
  createdAt: Scalars['String']['output'];
  /** Day of week (0=Sunday, 6=Saturday). Only for RECURRING. */
  dayOfWeek?: Maybe<Scalars['Int']['output']>;
  endTime: Scalars['String']['output'];
  /** Specific date. Only for ONE_TIME. */
  eventDate?: Maybe<Scalars['String']['output']>;
  /** Event name. Only for ONE_TIME. */
  eventName?: Maybe<Scalars['String']['output']>;
  frequency?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  label?: Maybe<Scalars['String']['output']>;
  marketID: Scalars['ID']['output'];
  scheduleType: ScheduleType;
  seasonEnd?: Maybe<Scalars['String']['output']>;
  seasonStart?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type MarketStatus =
  | 'ACTIVE'
  | 'CANCELLED'
  | 'ENDED_EARLY';

/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type Mutation = {
  __typename?: 'Mutation';
  /** Placeholder - no audit mutations. Audit writes are PostgreSQL trigger-only. */
  _empty?: Maybe<Scalars['Boolean']['output']>;
  /** Add a schedule entry to a market (Manager only). */
  addMarketSchedule: MarketSchedule;
  /** Add a vendor directly to the roster (Manager only). */
  addVendorToRoster: Array<VendorRosterEntry>;
  /** Approve a vendor roster request (Manager only). */
  approveRosterRequest: VendorRosterEntry;
  /** Assign a manager to a market (Admin only). */
  assignManager: Scalars['Boolean']['output'];
  /** Cancel a market day or end it early (Manager only). Set endEarly=true to mark as ended early instead of cancelled. */
  cancelMarket: Market;
  /** Check in to a market (Vendor only). */
  checkIn: CheckIn;
  /** Check out from a market (Vendor only). */
  checkOut: CheckIn;
  /** Create a new market (Manager only). */
  createMarket: Market;
  /** Create a product (Vendor only). */
  createProduct: Product;
  /** Create user record after role selection. Requires authentication. */
  createUser: CreateUserPayload;
  /** Create a vendor profile (Vendor only). */
  createVendorProfile: Vendor;
  /** Delete a schedule entry (Manager only). */
  deleteMarketSchedule: Scalars['Boolean']['output'];
  /** Delete a product (soft delete, Vendor only). */
  deleteProduct: Scalars['Boolean']['output'];
  /** Follow a vendor or market (Customer only). */
  follow: Follow;
  /** Invite a vendor to a market (Manager only). */
  inviteVendor: VendorInvitation;
  /** Login with a Firebase ID token. */
  login: AuthPayload;
  /** Reactivate a cancelled market (Manager only). */
  reactivateMarket: Market;
  /** Register a device token for push notifications. */
  registerDeviceToken: DeviceToken;
  /** Reject a vendor roster request with optional reason (Manager only). */
  rejectRosterRequest: VendorRosterEntry;
  /** Remove a device token. */
  removeDeviceToken: Scalars['Boolean']['output'];
  /** Remove a manager from a market (Admin only). Fails if it would leave fewer than 2 managers. */
  removeManager: Scalars['Boolean']['output'];
  /** Remove a vendor from the roster (Manager only). */
  removeVendorFromRoster: Scalars['Boolean']['output'];
  /** Report an exception status (Vendor only). */
  reportException: CheckIn;
  /** Request to join a market roster for specific dates (Vendor only). */
  requestToJoinMarket: Array<VendorRosterEntry>;
  /** Respond to an invitation (Vendor only). */
  respondToInvitation: VendorInvitation;
  /** Send a notification to all rostered vendors (Manager only). */
  sendVendorNotification: VendorNotification;
  /** Sign up a new user with a Firebase ID token and role selection. */
  signUp: AuthPayload;
  /** Unfollow a vendor or market (Customer only). */
  unfollow: Scalars['Boolean']['output'];
  /** Update an existing market (Manager only). */
  updateMarket: Market;
  /** Update market rules text (Manager only). */
  updateMarketRules: Market;
  /** Update a schedule entry (Manager only). */
  updateMarketSchedule: MarketSchedule;
  /** Update notification preferences. */
  updateNotificationPreferences: NotificationPreferences;
  /** Update a product (Vendor only). */
  updateProduct: Product;
  /** Approve or reject a vendor roster request (Manager only). @deprecated Use approveRosterRequest/rejectRosterRequest instead. */
  updateRosterStatus: VendorRosterEntry;
  /** Update vendor profile (Vendor only). */
  updateVendorProfile: Vendor;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationAddMarketScheduleArgs = {
  input: AddScheduleInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationAddVendorToRosterArgs = {
  dates: Array<Scalars['String']['input']>;
  marketID: Scalars['ID']['input'];
  vendorID: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationApproveRosterRequestArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationAssignManagerArgs = {
  managerID: Scalars['ID']['input'];
  marketID: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationCancelMarketArgs = {
  endEarly?: InputMaybe<Scalars['Boolean']['input']>;
  marketID: Scalars['ID']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  reason: CancellationReason;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationCheckInArgs = {
  input: CheckInInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationCheckOutArgs = {
  checkInID: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationCreateMarketArgs = {
  input: CreateMarketInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationCreateVendorProfileArgs = {
  input: CreateVendorProfileInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationDeleteMarketScheduleArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationDeleteProductArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationFollowArgs = {
  targetID: Scalars['ID']['input'];
  targetType: FollowTargetType;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationInviteVendorArgs = {
  marketID: Scalars['ID']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  targetDates?: InputMaybe<Array<Scalars['String']['input']>>;
  vendorID: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationLoginArgs = {
  input: LoginInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationReactivateMarketArgs = {
  marketID: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationRegisterDeviceTokenArgs = {
  input: RegisterDeviceTokenInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationRejectRosterRequestArgs = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationRemoveDeviceTokenArgs = {
  tokenID: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationRemoveManagerArgs = {
  managerID: Scalars['ID']['input'];
  marketID: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationRemoveVendorFromRosterArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationReportExceptionArgs = {
  input: ExceptionStatusInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationRequestToJoinMarketArgs = {
  acknowledgeRules: Scalars['Boolean']['input'];
  dates: Array<Scalars['String']['input']>;
  marketID: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationRespondToInvitationArgs = {
  accept: Scalars['Boolean']['input'];
  invitationID: Scalars['ID']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationSendVendorNotificationArgs = {
  marketID: Scalars['ID']['input'];
  message: Scalars['String']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationSignUpArgs = {
  input: SignUpInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationUnfollowArgs = {
  targetID: Scalars['ID']['input'];
  targetType: FollowTargetType;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationUpdateMarketArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMarketInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationUpdateMarketRulesArgs = {
  marketID: Scalars['ID']['input'];
  rulesText: Scalars['String']['input'];
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationUpdateMarketScheduleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateScheduleInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationUpdateNotificationPreferencesArgs = {
  input: UpdateNotificationPreferencesInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationUpdateProductArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProductInput;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationUpdateRosterStatusArgs = {
  id: Scalars['ID']['input'];
  status: VendorRosterStatus;
};


/**
 * Root Mutation type - extended by each domain schema.
 * No audit mutations exist; audit writes are DB trigger-only.
 */
export type MutationUpdateVendorProfileArgs = {
  input: UpdateVendorProfileInput;
};

/** Notification preferences and device token management. */
export type NotificationPreferences = {
  __typename?: 'NotificationPreferences';
  createdAt: Scalars['String']['output'];
  exceptionAlerts: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  marketUpdateAlerts: Scalars['Boolean']['output'];
  pushEnabled: Scalars['Boolean']['output'];
  updatedAt: Scalars['String']['output'];
  userID: Scalars['ID']['output'];
  vendorCheckInAlerts: Scalars['Boolean']['output'];
};

export type Platform =
  | 'ANDROID'
  | 'IOS';

export type Product = {
  __typename?: 'Product';
  category?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageURL?: Maybe<Scalars['String']['output']>;
  isAvailable: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  vendorID: Scalars['ID']['output'];
};

/** Root Query type - extended by each domain schema. */
export type Query = {
  __typename?: 'Query';
  /** Query audit log entries (Manager only, read-only). */
  auditLog: AuditLogConnection;
  /** Discover markets near a location. */
  discoverMarkets: Array<Market>;
  /** Discover vendors at a specific market. */
  discoverVendors: Array<Vendor>;
  /** Get the customer's followed vendors and markets activity feed. */
  followingFeed: Array<FollowingFeedItem>;
  /** Get a market by ID. */
  market?: Maybe<Market>;
  /** Get planning view for a range of future market dates (Manager only). */
  marketDayPlans: Array<MarketDayPlan>;
  /** Get the vendor roster for a market on a specific date (Manager only). */
  marketRoster: Array<VendorRosterEntry>;
  /** List all markets, optionally filtered by proximity. */
  markets: Array<Market>;
  /** Returns the currently authenticated user. */
  me: User;
  /** Get the authenticated customer's profile. */
  myCustomerProfile?: Maybe<CustomerProfile>;
  /** List invitations for the current vendor. */
  myInvitations: Array<VendorInvitation>;
  /** List markets managed by the current user (Manager only). */
  myMarkets: Array<Market>;
  /** Get the authenticated user's notification preferences. */
  myNotificationPreferences?: Maybe<NotificationPreferences>;
  /** Get vendor profile for the authenticated vendor user. */
  myVendorProfile?: Maybe<Vendor>;
  /** Search vendors by name or category (Manager only). */
  searchVendors: Array<Vendor>;
  /** Get a vendor by ID. */
  vendor?: Maybe<Vendor>;
  /** List products for a vendor. */
  vendorProducts: Array<Product>;
};


/** Root Query type - extended by each domain schema. */
export type QueryAuditLogArgs = {
  filter?: InputMaybe<AuditLogFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query type - extended by each domain schema. */
export type QueryDiscoverMarketsArgs = {
  latitude: Scalars['Float']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  longitude: Scalars['Float']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  radiusMiles: Scalars['Float']['input'];
};


/** Root Query type - extended by each domain schema. */
export type QueryDiscoverVendorsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  marketID: Scalars['ID']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query type - extended by each domain schema. */
export type QueryFollowingFeedArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query type - extended by each domain schema. */
export type QueryMarketArgs = {
  id: Scalars['ID']['input'];
};


/** Root Query type - extended by each domain schema. */
export type QueryMarketDayPlansArgs = {
  endDate: Scalars['String']['input'];
  marketID: Scalars['ID']['input'];
  startDate: Scalars['String']['input'];
};


/** Root Query type - extended by each domain schema. */
export type QueryMarketRosterArgs = {
  date: Scalars['String']['input'];
  marketID: Scalars['ID']['input'];
};


/** Root Query type - extended by each domain schema. */
export type QueryMarketsArgs = {
  latitude?: InputMaybe<Scalars['Float']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  radiusMiles?: InputMaybe<Scalars['Float']['input']>;
};


/** Root Query type - extended by each domain schema. */
export type QuerySearchVendorsArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


/** Root Query type - extended by each domain schema. */
export type QueryVendorArgs = {
  id: Scalars['ID']['input'];
};


/** Root Query type - extended by each domain schema. */
export type QueryVendorProductsArgs = {
  vendorID: Scalars['ID']['input'];
};

export type RegisterDeviceTokenInput = {
  platform: Platform;
  token: Scalars['String']['input'];
};

/**
 * Authentication types and mutations.
 * Handles Firebase Auth login/signup flows and role management.
 */
export type Role =
  | 'CUSTOMER'
  | 'MANAGER'
  | 'VENDOR';

export type ScheduleType =
  | 'ONE_TIME'
  | 'RECURRING';

export type SignUpInput = {
  displayName: Scalars['String']['input'];
  firebaseToken: Scalars['String']['input'];
  role: Role;
};

export type SocialLinks = {
  __typename?: 'SocialLinks';
  facebook?: Maybe<Scalars['String']['output']>;
  instagram?: Maybe<Scalars['String']['output']>;
  twitter?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type SocialLinksInput = {
  facebook?: InputMaybe<Scalars['String']['input']>;
  instagram?: InputMaybe<Scalars['String']['input']>;
  twitter?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMarketInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageURL?: InputMaybe<Scalars['String']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  socialLinks?: InputMaybe<SocialLinksInput>;
};

export type UpdateNotificationPreferencesInput = {
  exceptionAlerts?: InputMaybe<Scalars['Boolean']['input']>;
  marketUpdateAlerts?: InputMaybe<Scalars['Boolean']['input']>;
  pushEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  vendorCheckInAlerts?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateProductInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageURL?: InputMaybe<Scalars['String']['input']>;
  isAvailable?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateScheduleInput = {
  dayOfWeek?: InputMaybe<Scalars['Int']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  eventDate?: InputMaybe<Scalars['String']['input']>;
  eventName?: InputMaybe<Scalars['String']['input']>;
  frequency?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  seasonEnd?: InputMaybe<Scalars['String']['input']>;
  seasonStart?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateVendorProfileInput = {
  businessName?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageURL?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firebaseUID: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  role: Role;
  updatedAt: Scalars['String']['output'];
};

/** Vendor profile, product catalog, and check-in types. */
export type Vendor = {
  __typename?: 'Vendor';
  businessName: Scalars['String']['output'];
  checkIns: Array<CheckIn>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageURL?: Maybe<Scalars['String']['output']>;
  products: Array<Product>;
  updatedAt: Scalars['String']['output'];
  userID: Scalars['ID']['output'];
};

export type VendorInvitation = {
  __typename?: 'VendorInvitation';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  invitedBy: Scalars['ID']['output'];
  marketID: Scalars['ID']['output'];
  message?: Maybe<Scalars['String']['output']>;
  status: InvitationStatus;
  targetDates?: Maybe<Array<Scalars['String']['output']>>;
  updatedAt: Scalars['String']['output'];
  vendorID: Scalars['ID']['output'];
};

export type VendorNotification = {
  __typename?: 'VendorNotification';
  id: Scalars['ID']['output'];
  marketID: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  senderID: Scalars['ID']['output'];
  sentAt: Scalars['String']['output'];
};

export type VendorRosterEntry = {
  __typename?: 'VendorRosterEntry';
  createdAt: Scalars['String']['output'];
  date: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  invitedBy?: Maybe<Scalars['ID']['output']>;
  marketID: Scalars['ID']['output'];
  rejectionReason?: Maybe<Scalars['String']['output']>;
  rulesAcknowledged: Scalars['Boolean']['output'];
  status: VendorRosterStatus;
  updatedAt: Scalars['String']['output'];
  vendor: Vendor;
  vendorID: Scalars['ID']['output'];
};

export type VendorRosterStatus =
  | 'APPROVED'
  | 'COMMITTED'
  | 'INVITED'
  | 'NOT_ATTENDING'
  | 'PENDING'
  | 'REJECTED';

export type AddMarketScheduleMutationVariables = Exact<{
  input: AddScheduleInput;
}>;


export type AddMarketScheduleMutation = { __typename?: 'Mutation', addMarketSchedule: { __typename?: 'MarketSchedule', id: string, marketID: string, scheduleType: ScheduleType, dayOfWeek?: number | null, frequency?: string | null, seasonStart?: string | null, seasonEnd?: string | null, eventName?: string | null, eventDate?: string | null, startTime: string, endTime: string, label?: string | null, createdAt: string, updatedAt: string } };

export type ApproveRosterRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ApproveRosterRequestMutation = { __typename?: 'Mutation', approveRosterRequest: { __typename?: 'VendorRosterEntry', id: string, status: VendorRosterStatus, updatedAt: string } };

export type CancelMarketMutationVariables = Exact<{
  marketID: Scalars['ID']['input'];
  reason: CancellationReason;
  message?: InputMaybe<Scalars['String']['input']>;
  endEarly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CancelMarketMutation = { __typename?: 'Mutation', cancelMarket: { __typename?: 'Market', id: string, status: MarketStatus, cancellationReason?: string | null, cancellationMessage?: string | null, cancelledAt?: string | null, updatedAt: string } };

export type CreateMarketMutationVariables = Exact<{
  input: CreateMarketInput;
}>;


export type CreateMarketMutation = { __typename?: 'Mutation', createMarket: { __typename?: 'Market', id: string, name: string, description?: string | null, address: string, latitude: number, longitude: number, contactEmail: string, contactPhone?: string | null, imageURL?: string | null, createdAt: string, updatedAt: string, socialLinks?: { __typename?: 'SocialLinks', instagram?: string | null, facebook?: string | null, website?: string | null, twitter?: string | null } | null } };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'CreateUserPayload', user: { __typename?: 'User', id: string, firebaseUID: string, email: string, displayName: string, role: Role, createdAt: string } } };

export type DeleteMarketScheduleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteMarketScheduleMutation = { __typename?: 'Mutation', deleteMarketSchedule: boolean };

export type InviteVendorMutationVariables = Exact<{
  marketID: Scalars['ID']['input'];
  vendorID: Scalars['ID']['input'];
  targetDates?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
}>;


export type InviteVendorMutation = { __typename?: 'Mutation', inviteVendor: { __typename?: 'VendorInvitation', id: string, status: InvitationStatus, createdAt: string } };

export type ReactivateMarketMutationVariables = Exact<{
  marketID: Scalars['ID']['input'];
}>;


export type ReactivateMarketMutation = { __typename?: 'Mutation', reactivateMarket: { __typename?: 'Market', id: string, status: MarketStatus, updatedAt: string } };

export type RejectRosterRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type RejectRosterRequestMutation = { __typename?: 'Mutation', rejectRosterRequest: { __typename?: 'VendorRosterEntry', id: string, status: VendorRosterStatus, rejectionReason?: string | null, updatedAt: string } };

export type RemoveVendorFromRosterMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RemoveVendorFromRosterMutation = { __typename?: 'Mutation', removeVendorFromRoster: boolean };

export type SendVendorNotificationMutationVariables = Exact<{
  marketID: Scalars['ID']['input'];
  message: Scalars['String']['input'];
}>;


export type SendVendorNotificationMutation = { __typename?: 'Mutation', sendVendorNotification: { __typename?: 'VendorNotification', id: string, marketID: string, senderID: string, message: string, sentAt: string } };

export type UpdateMarketMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateMarketInput;
}>;


export type UpdateMarketMutation = { __typename?: 'Mutation', updateMarket: { __typename?: 'Market', id: string, name: string, description?: string | null, address: string, latitude: number, longitude: number, contactEmail: string, contactPhone?: string | null, imageURL?: string | null, createdAt: string, updatedAt: string, socialLinks?: { __typename?: 'SocialLinks', instagram?: string | null, facebook?: string | null, website?: string | null, twitter?: string | null } | null } };

export type UpdateMarketRulesMutationVariables = Exact<{
  marketID: Scalars['ID']['input'];
  rulesText: Scalars['String']['input'];
}>;


export type UpdateMarketRulesMutation = { __typename?: 'Mutation', updateMarketRules: { __typename?: 'Market', id: string, rulesText?: string | null, rulesUpdatedAt?: string | null, updatedAt: string } };

export type UpdateMarketScheduleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateScheduleInput;
}>;


export type UpdateMarketScheduleMutation = { __typename?: 'Mutation', updateMarketSchedule: { __typename?: 'MarketSchedule', id: string, marketID: string, scheduleType: ScheduleType, dayOfWeek?: number | null, frequency?: string | null, seasonStart?: string | null, seasonEnd?: string | null, eventName?: string | null, eventDate?: string | null, startTime: string, endTime: string, label?: string | null, createdAt: string, updatedAt: string } };

export type GetMarketQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMarketQuery = { __typename?: 'Query', market?: { __typename?: 'Market', id: string, name: string, description?: string | null, address: string, latitude: number, longitude: number, contactEmail: string, contactPhone?: string | null, imageURL?: string | null, createdAt: string, updatedAt: string, socialLinks?: { __typename?: 'SocialLinks', instagram?: string | null, facebook?: string | null, website?: string | null, twitter?: string | null } | null } | null };

export type MarketDayPlansQueryVariables = Exact<{
  marketID: Scalars['ID']['input'];
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
}>;


export type MarketDayPlansQuery = { __typename?: 'Query', marketDayPlans: Array<{ __typename?: 'MarketDayPlan', date: string, vendorCount: number }> };

export type MarketRosterQueryVariables = Exact<{
  marketID: Scalars['ID']['input'];
  date: Scalars['String']['input'];
}>;


export type MarketRosterQuery = { __typename?: 'Query', marketRoster: Array<{ __typename?: 'VendorRosterEntry', id: string, marketID: string, vendorID: string, status: VendorRosterStatus, date: string, rulesAcknowledged: boolean, createdAt: string, updatedAt: string }> };

export type MyMarketsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyMarketsQuery = { __typename?: 'Query', myMarkets: Array<{ __typename?: 'Market', id: string, name: string, description?: string | null, address: string, latitude: number, longitude: number, contactEmail: string, contactPhone?: string | null, imageURL?: string | null, createdAt: string, updatedAt: string }> };


export const AddMarketScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddMarketSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddScheduleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addMarketSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"marketID"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleType"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"seasonStart"}},{"kind":"Field","name":{"kind":"Name","value":"seasonEnd"}},{"kind":"Field","name":{"kind":"Name","value":"eventName"}},{"kind":"Field","name":{"kind":"Name","value":"eventDate"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AddMarketScheduleMutation, AddMarketScheduleMutationVariables>;
export const ApproveRosterRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApproveRosterRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approveRosterRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ApproveRosterRequestMutation, ApproveRosterRequestMutationVariables>;
export const CancelMarketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelMarket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CancellationReason"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"message"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endEarly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelMarket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"marketID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}},{"kind":"Argument","name":{"kind":"Name","value":"message"},"value":{"kind":"Variable","name":{"kind":"Name","value":"message"}}},{"kind":"Argument","name":{"kind":"Name","value":"endEarly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endEarly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationMessage"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CancelMarketMutation, CancelMarketMutationVariables>;
export const CreateMarketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMarket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMarketInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMarket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instagram"}},{"kind":"Field","name":{"kind":"Name","value":"facebook"}},{"kind":"Field","name":{"kind":"Name","value":"website"}},{"kind":"Field","name":{"kind":"Name","value":"twitter"}}]}},{"kind":"Field","name":{"kind":"Name","value":"imageURL"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateMarketMutation, CreateMarketMutationVariables>;
export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firebaseUID"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const DeleteMarketScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMarketSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMarketSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteMarketScheduleMutation, DeleteMarketScheduleMutationVariables>;
export const InviteVendorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InviteVendor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"vendorID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetDates"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"message"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inviteVendor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"marketID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}}},{"kind":"Argument","name":{"kind":"Name","value":"vendorID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"vendorID"}}},{"kind":"Argument","name":{"kind":"Name","value":"targetDates"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetDates"}}},{"kind":"Argument","name":{"kind":"Name","value":"message"},"value":{"kind":"Variable","name":{"kind":"Name","value":"message"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<InviteVendorMutation, InviteVendorMutationVariables>;
export const ReactivateMarketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReactivateMarket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reactivateMarket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"marketID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ReactivateMarketMutation, ReactivateMarketMutationVariables>;
export const RejectRosterRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectRosterRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectRosterRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"rejectionReason"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<RejectRosterRequestMutation, RejectRosterRequestMutationVariables>;
export const RemoveVendorFromRosterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveVendorFromRoster"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeVendorFromRoster"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RemoveVendorFromRosterMutation, RemoveVendorFromRosterMutationVariables>;
export const SendVendorNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendVendorNotification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"message"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendVendorNotification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"marketID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}}},{"kind":"Argument","name":{"kind":"Name","value":"message"},"value":{"kind":"Variable","name":{"kind":"Name","value":"message"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"marketID"}},{"kind":"Field","name":{"kind":"Name","value":"senderID"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}}]}}]}}]} as unknown as DocumentNode<SendVendorNotificationMutation, SendVendorNotificationMutationVariables>;
export const UpdateMarketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMarket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMarketInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMarket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instagram"}},{"kind":"Field","name":{"kind":"Name","value":"facebook"}},{"kind":"Field","name":{"kind":"Name","value":"website"}},{"kind":"Field","name":{"kind":"Name","value":"twitter"}}]}},{"kind":"Field","name":{"kind":"Name","value":"imageURL"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMarketMutation, UpdateMarketMutationVariables>;
export const UpdateMarketRulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMarketRules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rulesText"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMarketRules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"marketID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}}},{"kind":"Argument","name":{"kind":"Name","value":"rulesText"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rulesText"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rulesText"}},{"kind":"Field","name":{"kind":"Name","value":"rulesUpdatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMarketRulesMutation, UpdateMarketRulesMutationVariables>;
export const UpdateMarketScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMarketSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateScheduleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMarketSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"marketID"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleType"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"seasonStart"}},{"kind":"Field","name":{"kind":"Name","value":"seasonEnd"}},{"kind":"Field","name":{"kind":"Name","value":"eventName"}},{"kind":"Field","name":{"kind":"Name","value":"eventDate"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMarketScheduleMutation, UpdateMarketScheduleMutationVariables>;
export const GetMarketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMarket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"market"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instagram"}},{"kind":"Field","name":{"kind":"Name","value":"facebook"}},{"kind":"Field","name":{"kind":"Name","value":"website"}},{"kind":"Field","name":{"kind":"Name","value":"twitter"}}]}},{"kind":"Field","name":{"kind":"Name","value":"imageURL"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetMarketQuery, GetMarketQueryVariables>;
export const MarketDayPlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MarketDayPlans"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marketDayPlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"marketID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}}},{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"vendorCount"}}]}}]}}]} as unknown as DocumentNode<MarketDayPlansQuery, MarketDayPlansQueryVariables>;
export const MarketRosterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MarketRoster"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marketRoster"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"marketID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"marketID"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"marketID"}},{"kind":"Field","name":{"kind":"Name","value":"vendorID"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"rulesAcknowledged"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MarketRosterQuery, MarketRosterQueryVariables>;
export const MyMarketsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyMarkets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myMarkets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"imageURL"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MyMarketsQuery, MyMarketsQueryVariables>;