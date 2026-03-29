/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation AddMarketSchedule($input: AddScheduleInput!) {\n  addMarketSchedule(input: $input) {\n    id\n    marketID\n    scheduleType\n    dayOfWeek\n    frequency\n    seasonStart\n    seasonEnd\n    eventName\n    eventDate\n    startTime\n    endTime\n    label\n    createdAt\n    updatedAt\n  }\n}": typeof types.AddMarketScheduleDocument,
    "mutation ApproveRosterRequest($id: ID!) {\n  approveRosterRequest(id: $id) {\n    id\n    status\n    updatedAt\n  }\n}": typeof types.ApproveRosterRequestDocument,
    "mutation CancelMarket($marketID: ID!, $reason: CancellationReason!, $message: String) {\n  cancelMarket(marketID: $marketID, reason: $reason, message: $message) {\n    id\n    status\n    cancellationReason\n    cancellationMessage\n    cancelledAt\n    updatedAt\n  }\n}": typeof types.CancelMarketDocument,
    "mutation CreateMarket($input: CreateMarketInput!) {\n  createMarket(input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": typeof types.CreateMarketDocument,
    "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    user {\n      id\n      firebaseUID\n      email\n      displayName\n      role\n      createdAt\n    }\n  }\n}": typeof types.CreateUserDocument,
    "mutation DeleteMarketSchedule($id: ID!) {\n  deleteMarketSchedule(id: $id)\n}": typeof types.DeleteMarketScheduleDocument,
    "mutation InviteVendor($marketID: ID!, $vendorID: ID!, $targetDates: [String!], $message: String) {\n  inviteVendor(\n    marketID: $marketID\n    vendorID: $vendorID\n    targetDates: $targetDates\n    message: $message\n  ) {\n    id\n    status\n    createdAt\n  }\n}": typeof types.InviteVendorDocument,
    "mutation ReactivateMarket($marketID: ID!) {\n  reactivateMarket(marketID: $marketID) {\n    id\n    status\n    updatedAt\n  }\n}": typeof types.ReactivateMarketDocument,
    "mutation RejectRosterRequest($id: ID!, $reason: String) {\n  rejectRosterRequest(id: $id, reason: $reason) {\n    id\n    status\n    rejectionReason\n    updatedAt\n  }\n}": typeof types.RejectRosterRequestDocument,
    "mutation RemoveVendorFromRoster($id: ID!) {\n  removeVendorFromRoster(id: $id)\n}": typeof types.RemoveVendorFromRosterDocument,
    "mutation SendVendorNotification($marketID: ID!, $message: String!) {\n  sendVendorNotification(marketID: $marketID, message: $message) {\n    id\n    marketID\n    senderID\n    message\n    sentAt\n  }\n}": typeof types.SendVendorNotificationDocument,
    "mutation UpdateMarket($id: ID!, $input: UpdateMarketInput!) {\n  updateMarket(id: $id, input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": typeof types.UpdateMarketDocument,
    "mutation UpdateMarketRules($marketID: ID!, $rulesText: String!) {\n  updateMarketRules(marketID: $marketID, rulesText: $rulesText) {\n    id\n    rulesText\n    rulesUpdatedAt\n    updatedAt\n  }\n}": typeof types.UpdateMarketRulesDocument,
    "mutation UpdateMarketSchedule($id: ID!, $input: UpdateScheduleInput!) {\n  updateMarketSchedule(id: $id, input: $input) {\n    id\n    marketID\n    scheduleType\n    dayOfWeek\n    frequency\n    seasonStart\n    seasonEnd\n    eventName\n    eventDate\n    startTime\n    endTime\n    label\n    createdAt\n    updatedAt\n  }\n}": typeof types.UpdateMarketScheduleDocument,
    "query GetMarket($id: ID!) {\n  market(id: $id) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": typeof types.GetMarketDocument,
    "query MarketDayPlans($marketID: ID!, $startDate: String!, $endDate: String!) {\n  marketDayPlans(marketID: $marketID, startDate: $startDate, endDate: $endDate) {\n    date\n    vendorCount\n  }\n}": typeof types.MarketDayPlansDocument,
    "query MarketRoster($marketID: ID!, $date: String!) {\n  marketRoster(marketID: $marketID, date: $date) {\n    id\n    marketID\n    vendorID\n    status\n    date\n    rulesAcknowledged\n    createdAt\n    updatedAt\n  }\n}": typeof types.MarketRosterDocument,
    "query MyMarkets {\n  myMarkets {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": typeof types.MyMarketsDocument,
};
const documents: Documents = {
    "mutation AddMarketSchedule($input: AddScheduleInput!) {\n  addMarketSchedule(input: $input) {\n    id\n    marketID\n    scheduleType\n    dayOfWeek\n    frequency\n    seasonStart\n    seasonEnd\n    eventName\n    eventDate\n    startTime\n    endTime\n    label\n    createdAt\n    updatedAt\n  }\n}": types.AddMarketScheduleDocument,
    "mutation ApproveRosterRequest($id: ID!) {\n  approveRosterRequest(id: $id) {\n    id\n    status\n    updatedAt\n  }\n}": types.ApproveRosterRequestDocument,
    "mutation CancelMarket($marketID: ID!, $reason: CancellationReason!, $message: String) {\n  cancelMarket(marketID: $marketID, reason: $reason, message: $message) {\n    id\n    status\n    cancellationReason\n    cancellationMessage\n    cancelledAt\n    updatedAt\n  }\n}": types.CancelMarketDocument,
    "mutation CreateMarket($input: CreateMarketInput!) {\n  createMarket(input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": types.CreateMarketDocument,
    "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    user {\n      id\n      firebaseUID\n      email\n      displayName\n      role\n      createdAt\n    }\n  }\n}": types.CreateUserDocument,
    "mutation DeleteMarketSchedule($id: ID!) {\n  deleteMarketSchedule(id: $id)\n}": types.DeleteMarketScheduleDocument,
    "mutation InviteVendor($marketID: ID!, $vendorID: ID!, $targetDates: [String!], $message: String) {\n  inviteVendor(\n    marketID: $marketID\n    vendorID: $vendorID\n    targetDates: $targetDates\n    message: $message\n  ) {\n    id\n    status\n    createdAt\n  }\n}": types.InviteVendorDocument,
    "mutation ReactivateMarket($marketID: ID!) {\n  reactivateMarket(marketID: $marketID) {\n    id\n    status\n    updatedAt\n  }\n}": types.ReactivateMarketDocument,
    "mutation RejectRosterRequest($id: ID!, $reason: String) {\n  rejectRosterRequest(id: $id, reason: $reason) {\n    id\n    status\n    rejectionReason\n    updatedAt\n  }\n}": types.RejectRosterRequestDocument,
    "mutation RemoveVendorFromRoster($id: ID!) {\n  removeVendorFromRoster(id: $id)\n}": types.RemoveVendorFromRosterDocument,
    "mutation SendVendorNotification($marketID: ID!, $message: String!) {\n  sendVendorNotification(marketID: $marketID, message: $message) {\n    id\n    marketID\n    senderID\n    message\n    sentAt\n  }\n}": types.SendVendorNotificationDocument,
    "mutation UpdateMarket($id: ID!, $input: UpdateMarketInput!) {\n  updateMarket(id: $id, input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": types.UpdateMarketDocument,
    "mutation UpdateMarketRules($marketID: ID!, $rulesText: String!) {\n  updateMarketRules(marketID: $marketID, rulesText: $rulesText) {\n    id\n    rulesText\n    rulesUpdatedAt\n    updatedAt\n  }\n}": types.UpdateMarketRulesDocument,
    "mutation UpdateMarketSchedule($id: ID!, $input: UpdateScheduleInput!) {\n  updateMarketSchedule(id: $id, input: $input) {\n    id\n    marketID\n    scheduleType\n    dayOfWeek\n    frequency\n    seasonStart\n    seasonEnd\n    eventName\n    eventDate\n    startTime\n    endTime\n    label\n    createdAt\n    updatedAt\n  }\n}": types.UpdateMarketScheduleDocument,
    "query GetMarket($id: ID!) {\n  market(id: $id) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": types.GetMarketDocument,
    "query MarketDayPlans($marketID: ID!, $startDate: String!, $endDate: String!) {\n  marketDayPlans(marketID: $marketID, startDate: $startDate, endDate: $endDate) {\n    date\n    vendorCount\n  }\n}": types.MarketDayPlansDocument,
    "query MarketRoster($marketID: ID!, $date: String!) {\n  marketRoster(marketID: $marketID, date: $date) {\n    id\n    marketID\n    vendorID\n    status\n    date\n    rulesAcknowledged\n    createdAt\n    updatedAt\n  }\n}": types.MarketRosterDocument,
    "query MyMarkets {\n  myMarkets {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": types.MyMarketsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation AddMarketSchedule($input: AddScheduleInput!) {\n  addMarketSchedule(input: $input) {\n    id\n    marketID\n    scheduleType\n    dayOfWeek\n    frequency\n    seasonStart\n    seasonEnd\n    eventName\n    eventDate\n    startTime\n    endTime\n    label\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation AddMarketSchedule($input: AddScheduleInput!) {\n  addMarketSchedule(input: $input) {\n    id\n    marketID\n    scheduleType\n    dayOfWeek\n    frequency\n    seasonStart\n    seasonEnd\n    eventName\n    eventDate\n    startTime\n    endTime\n    label\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ApproveRosterRequest($id: ID!) {\n  approveRosterRequest(id: $id) {\n    id\n    status\n    updatedAt\n  }\n}"): (typeof documents)["mutation ApproveRosterRequest($id: ID!) {\n  approveRosterRequest(id: $id) {\n    id\n    status\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CancelMarket($marketID: ID!, $reason: CancellationReason!, $message: String) {\n  cancelMarket(marketID: $marketID, reason: $reason, message: $message) {\n    id\n    status\n    cancellationReason\n    cancellationMessage\n    cancelledAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation CancelMarket($marketID: ID!, $reason: CancellationReason!, $message: String) {\n  cancelMarket(marketID: $marketID, reason: $reason, message: $message) {\n    id\n    status\n    cancellationReason\n    cancellationMessage\n    cancelledAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateMarket($input: CreateMarketInput!) {\n  createMarket(input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation CreateMarket($input: CreateMarketInput!) {\n  createMarket(input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    user {\n      id\n      firebaseUID\n      email\n      displayName\n      role\n      createdAt\n    }\n  }\n}"): (typeof documents)["mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    user {\n      id\n      firebaseUID\n      email\n      displayName\n      role\n      createdAt\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DeleteMarketSchedule($id: ID!) {\n  deleteMarketSchedule(id: $id)\n}"): (typeof documents)["mutation DeleteMarketSchedule($id: ID!) {\n  deleteMarketSchedule(id: $id)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation InviteVendor($marketID: ID!, $vendorID: ID!, $targetDates: [String!], $message: String) {\n  inviteVendor(\n    marketID: $marketID\n    vendorID: $vendorID\n    targetDates: $targetDates\n    message: $message\n  ) {\n    id\n    status\n    createdAt\n  }\n}"): (typeof documents)["mutation InviteVendor($marketID: ID!, $vendorID: ID!, $targetDates: [String!], $message: String) {\n  inviteVendor(\n    marketID: $marketID\n    vendorID: $vendorID\n    targetDates: $targetDates\n    message: $message\n  ) {\n    id\n    status\n    createdAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ReactivateMarket($marketID: ID!) {\n  reactivateMarket(marketID: $marketID) {\n    id\n    status\n    updatedAt\n  }\n}"): (typeof documents)["mutation ReactivateMarket($marketID: ID!) {\n  reactivateMarket(marketID: $marketID) {\n    id\n    status\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RejectRosterRequest($id: ID!, $reason: String) {\n  rejectRosterRequest(id: $id, reason: $reason) {\n    id\n    status\n    rejectionReason\n    updatedAt\n  }\n}"): (typeof documents)["mutation RejectRosterRequest($id: ID!, $reason: String) {\n  rejectRosterRequest(id: $id, reason: $reason) {\n    id\n    status\n    rejectionReason\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RemoveVendorFromRoster($id: ID!) {\n  removeVendorFromRoster(id: $id)\n}"): (typeof documents)["mutation RemoveVendorFromRoster($id: ID!) {\n  removeVendorFromRoster(id: $id)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SendVendorNotification($marketID: ID!, $message: String!) {\n  sendVendorNotification(marketID: $marketID, message: $message) {\n    id\n    marketID\n    senderID\n    message\n    sentAt\n  }\n}"): (typeof documents)["mutation SendVendorNotification($marketID: ID!, $message: String!) {\n  sendVendorNotification(marketID: $marketID, message: $message) {\n    id\n    marketID\n    senderID\n    message\n    sentAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateMarket($id: ID!, $input: UpdateMarketInput!) {\n  updateMarket(id: $id, input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation UpdateMarket($id: ID!, $input: UpdateMarketInput!) {\n  updateMarket(id: $id, input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateMarketRules($marketID: ID!, $rulesText: String!) {\n  updateMarketRules(marketID: $marketID, rulesText: $rulesText) {\n    id\n    rulesText\n    rulesUpdatedAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation UpdateMarketRules($marketID: ID!, $rulesText: String!) {\n  updateMarketRules(marketID: $marketID, rulesText: $rulesText) {\n    id\n    rulesText\n    rulesUpdatedAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateMarketSchedule($id: ID!, $input: UpdateScheduleInput!) {\n  updateMarketSchedule(id: $id, input: $input) {\n    id\n    marketID\n    scheduleType\n    dayOfWeek\n    frequency\n    seasonStart\n    seasonEnd\n    eventName\n    eventDate\n    startTime\n    endTime\n    label\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation UpdateMarketSchedule($id: ID!, $input: UpdateScheduleInput!) {\n  updateMarketSchedule(id: $id, input: $input) {\n    id\n    marketID\n    scheduleType\n    dayOfWeek\n    frequency\n    seasonStart\n    seasonEnd\n    eventName\n    eventDate\n    startTime\n    endTime\n    label\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetMarket($id: ID!) {\n  market(id: $id) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query GetMarket($id: ID!) {\n  market(id: $id) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query MarketDayPlans($marketID: ID!, $startDate: String!, $endDate: String!) {\n  marketDayPlans(marketID: $marketID, startDate: $startDate, endDate: $endDate) {\n    date\n    vendorCount\n  }\n}"): (typeof documents)["query MarketDayPlans($marketID: ID!, $startDate: String!, $endDate: String!) {\n  marketDayPlans(marketID: $marketID, startDate: $startDate, endDate: $endDate) {\n    date\n    vendorCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query MarketRoster($marketID: ID!, $date: String!) {\n  marketRoster(marketID: $marketID, date: $date) {\n    id\n    marketID\n    vendorID\n    status\n    date\n    rulesAcknowledged\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query MarketRoster($marketID: ID!, $date: String!) {\n  marketRoster(marketID: $marketID, date: $date) {\n    id\n    marketID\n    vendorID\n    status\n    date\n    rulesAcknowledged\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query MyMarkets {\n  myMarkets {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query MyMarkets {\n  myMarkets {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;