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
    "mutation CancelMarket($marketID: ID!, $reason: CancellationReason!, $message: String, $endEarly: Boolean) {\n  cancelMarket(\n    marketID: $marketID\n    reason: $reason\n    message: $message\n    endEarly: $endEarly\n  ) {\n    id\n    status\n    cancellationReason\n    cancellationMessage\n    cancelledAt\n    updatedAt\n  }\n}": typeof types.CancelMarketDocument,
    "mutation CreateMarket($input: CreateMarketInput!) {\n  createMarket(input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": typeof types.CreateMarketDocument,
    "mutation CreateProduct($input: CreateProductInput!) {\n  createProduct(input: $input) {\n    id\n    vendorID\n    name\n    description\n    category\n    imageURL\n    isAvailable\n    createdAt\n    updatedAt\n  }\n}": typeof types.CreateProductDocument,
    "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    user {\n      id\n      firebaseUID\n      email\n      displayName\n      role\n      createdAt\n    }\n  }\n}": typeof types.CreateUserDocument,
    "mutation CreateVendorProfile($input: CreateVendorProfileInput!) {\n  createVendorProfile(input: $input) {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": typeof types.CreateVendorProfileDocument,
    "mutation DeleteMarketSchedule($id: ID!) {\n  deleteMarketSchedule(id: $id)\n}": typeof types.DeleteMarketScheduleDocument,
    "mutation DeleteProduct($id: ID!) {\n  deleteProduct(id: $id)\n}": typeof types.DeleteProductDocument,
    "mutation Follow($targetType: FollowTargetType!, $targetID: ID!) {\n  follow(targetType: $targetType, targetID: $targetID) {\n    id\n    customerID\n    targetType\n    targetID\n    createdAt\n  }\n}": typeof types.FollowDocument,
    "mutation InviteVendor($marketID: ID!, $vendorID: ID!, $targetDates: [String!], $message: String) {\n  inviteVendor(\n    marketID: $marketID\n    vendorID: $vendorID\n    targetDates: $targetDates\n    message: $message\n  ) {\n    id\n    status\n    createdAt\n  }\n}": typeof types.InviteVendorDocument,
    "mutation ReactivateMarket($marketID: ID!) {\n  reactivateMarket(marketID: $marketID) {\n    id\n    status\n    updatedAt\n  }\n}": typeof types.ReactivateMarketDocument,
    "mutation RegisterDeviceToken($input: RegisterDeviceTokenInput!) {\n  registerDeviceToken(input: $input) {\n    id\n    userID\n    token\n    platform\n    createdAt\n  }\n}": typeof types.RegisterDeviceTokenDocument,
    "mutation RejectRosterRequest($id: ID!, $reason: String) {\n  rejectRosterRequest(id: $id, reason: $reason) {\n    id\n    status\n    rejectionReason\n    updatedAt\n  }\n}": typeof types.RejectRosterRequestDocument,
    "mutation RemoveDeviceToken($tokenID: ID!) {\n  removeDeviceToken(tokenID: $tokenID)\n}": typeof types.RemoveDeviceTokenDocument,
    "mutation RemoveVendorFromRoster($id: ID!) {\n  removeVendorFromRoster(id: $id)\n}": typeof types.RemoveVendorFromRosterDocument,
    "mutation RequestToJoinMarket($marketID: ID!, $dates: [String!]!, $acknowledgeRules: Boolean!) {\n  requestToJoinMarket(\n    marketID: $marketID\n    dates: $dates\n    acknowledgeRules: $acknowledgeRules\n  ) {\n    id\n    marketID\n    vendorID\n    status\n    date\n    rulesAcknowledged\n    createdAt\n  }\n}": typeof types.RequestToJoinMarketDocument,
    "mutation SendVendorNotification($marketID: ID!, $message: String!) {\n  sendVendorNotification(marketID: $marketID, message: $message) {\n    id\n    marketID\n    senderID\n    message\n    sentAt\n  }\n}": typeof types.SendVendorNotificationDocument,
    "mutation Unfollow($targetType: FollowTargetType!, $targetID: ID!) {\n  unfollow(targetType: $targetType, targetID: $targetID)\n}": typeof types.UnfollowDocument,
    "mutation UpdateMarket($id: ID!, $input: UpdateMarketInput!) {\n  updateMarket(id: $id, input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": typeof types.UpdateMarketDocument,
    "mutation UpdateMarketRules($marketID: ID!, $rulesText: String!) {\n  updateMarketRules(marketID: $marketID, rulesText: $rulesText) {\n    id\n    rulesText\n    rulesUpdatedAt\n    updatedAt\n  }\n}": typeof types.UpdateMarketRulesDocument,
    "mutation UpdateMarketSchedule($id: ID!, $input: UpdateScheduleInput!) {\n  updateMarketSchedule(id: $id, input: $input) {\n    id\n    marketID\n    scheduleType\n    dayOfWeek\n    frequency\n    seasonStart\n    seasonEnd\n    eventName\n    eventDate\n    startTime\n    endTime\n    label\n    createdAt\n    updatedAt\n  }\n}": typeof types.UpdateMarketScheduleDocument,
    "mutation UpdateNotificationPrefs($input: UpdateNotificationPreferencesInput!) {\n  updateNotificationPreferences(input: $input) {\n    id\n    userID\n    pushEnabled\n    vendorCheckInAlerts\n    marketUpdateAlerts\n    exceptionAlerts\n    createdAt\n    updatedAt\n  }\n}": typeof types.UpdateNotificationPrefsDocument,
    "mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {\n  updateProduct(id: $id, input: $input) {\n    id\n    vendorID\n    name\n    description\n    category\n    imageURL\n    isAvailable\n    createdAt\n    updatedAt\n  }\n}": typeof types.UpdateProductDocument,
    "mutation UpdateVendorProfile($input: UpdateVendorProfileInput!) {\n  updateVendorProfile(input: $input) {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": typeof types.UpdateVendorProfileDocument,
    "query ActivityFeed($limit: Int, $offset: Int) {\n  activityFeed(limit: $limit, offset: $offset) {\n    id\n    actorID\n    actionType\n    targetType\n    targetID\n    marketID\n    message\n    createdAt\n  }\n}": typeof types.ActivityFeedDocument,
    "query DiscoverMarkets($latitude: Float!, $longitude: Float!, $radiusMiles: Float!, $limit: Int, $offset: Int) {\n  discoverMarkets(\n    latitude: $latitude\n    longitude: $longitude\n    radiusMiles: $radiusMiles\n    limit: $limit\n    offset: $offset\n  ) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    imageURL\n    status\n  }\n}": typeof types.DiscoverMarketsDocument,
    "query DiscoverVendors($marketID: ID!, $limit: Int, $offset: Int) {\n  discoverVendors(marketID: $marketID, limit: $limit, offset: $offset) {\n    id\n    businessName\n    description\n    imageURL\n    products {\n      id\n      name\n      category\n      isAvailable\n    }\n  }\n}": typeof types.DiscoverVendorsDocument,
    "query FollowingFeed($limit: Int, $offset: Int) {\n  followingFeed(limit: $limit, offset: $offset) {\n    id\n    type\n    vendor {\n      id\n      businessName\n      imageURL\n    }\n    market {\n      id\n      name\n      address\n    }\n    timestamp\n    message\n  }\n}": typeof types.FollowingFeedDocument,
    "query GetMarket($id: ID!) {\n  market(id: $id) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    rulesText\n    rulesUpdatedAt\n    status\n    schedule {\n      id\n      scheduleType\n      dayOfWeek\n      startTime\n      endTime\n      seasonStart\n      seasonEnd\n      eventName\n      eventDate\n      label\n    }\n    createdAt\n    updatedAt\n  }\n}": typeof types.GetMarketDocument,
    "query MarketActivityFeed($marketID: ID!, $limit: Int, $offset: Int) {\n  marketActivityFeed(marketID: $marketID, limit: $limit, offset: $offset) {\n    id\n    actorID\n    actionType\n    targetType\n    targetID\n    marketID\n    message\n    createdAt\n  }\n}": typeof types.MarketActivityFeedDocument,
    "query MarketDayPlans($marketID: ID!, $startDate: String!, $endDate: String!) {\n  marketDayPlans(marketID: $marketID, startDate: $startDate, endDate: $endDate) {\n    date\n    vendorCount\n  }\n}": typeof types.MarketDayPlansDocument,
    "query MarketRoster($marketID: ID!, $date: String!) {\n  marketRoster(marketID: $marketID, date: $date) {\n    id\n    marketID\n    vendorID\n    status\n    date\n    rulesAcknowledged\n    createdAt\n    updatedAt\n  }\n}": typeof types.MarketRosterDocument,
    "query MyCustomerProfile {\n  myCustomerProfile {\n    id\n    userID\n    displayName\n    followedVendors {\n      id\n      businessName\n      imageURL\n    }\n    followedMarkets {\n      id\n      name\n      address\n    }\n    createdAt\n    updatedAt\n  }\n}": typeof types.MyCustomerProfileDocument,
    "query MyMarkets {\n  myMarkets {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": typeof types.MyMarketsDocument,
    "query MyNotificationPrefs {\n  myNotificationPreferences {\n    id\n    userID\n    pushEnabled\n    vendorCheckInAlerts\n    marketUpdateAlerts\n    exceptionAlerts\n    createdAt\n    updatedAt\n  }\n}": typeof types.MyNotificationPrefsDocument,
    "query MyVendorProfile {\n  myVendorProfile {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    products {\n      id\n      name\n      description\n      category\n      imageURL\n      isAvailable\n    }\n    createdAt\n    updatedAt\n  }\n}": typeof types.MyVendorProfileDocument,
    "query SearchMarketsToJoin($input: SearchMarketsInput!) {\n  searchMarketsToJoin(input: $input) {\n    market {\n      id\n      name\n      description\n      address\n      latitude\n      longitude\n      contactEmail\n      contactPhone\n      rulesText\n      rulesUpdatedAt\n      status\n      schedule {\n        id\n        scheduleType\n        dayOfWeek\n        startTime\n        endTime\n        seasonStart\n        seasonEnd\n        eventName\n        eventDate\n        label\n      }\n    }\n    distanceKm\n    vendorCount\n    vendorStatus\n  }\n}": typeof types.SearchMarketsToJoinDocument,
    "query Vendor($id: ID!) {\n  vendor(id: $id) {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    products {\n      id\n      name\n      description\n      category\n      imageURL\n      isAvailable\n    }\n    checkIns {\n      id\n      marketID\n      status\n      checkedInAt\n      checkedOutAt\n    }\n    createdAt\n    updatedAt\n  }\n}": typeof types.VendorDocument,
    "query VendorMarkets {\n  vendorMarkets {\n    market {\n      id\n      name\n      address\n      status\n      schedule {\n        id\n        scheduleType\n        dayOfWeek\n        startTime\n        endTime\n      }\n    }\n    status\n    dates {\n      id\n      date\n      status\n    }\n    nextUpcomingDate\n  }\n}": typeof types.VendorMarketsDocument,
    "query VendorProducts($vendorID: ID!) {\n  vendorProducts(vendorID: $vendorID) {\n    id\n    vendorID\n    name\n    description\n    category\n    imageURL\n    isAvailable\n    createdAt\n    updatedAt\n  }\n}": typeof types.VendorProductsDocument,
};
const documents: Documents = {
    "mutation AddMarketSchedule($input: AddScheduleInput!) {\n  addMarketSchedule(input: $input) {\n    id\n    marketID\n    scheduleType\n    dayOfWeek\n    frequency\n    seasonStart\n    seasonEnd\n    eventName\n    eventDate\n    startTime\n    endTime\n    label\n    createdAt\n    updatedAt\n  }\n}": types.AddMarketScheduleDocument,
    "mutation ApproveRosterRequest($id: ID!) {\n  approveRosterRequest(id: $id) {\n    id\n    status\n    updatedAt\n  }\n}": types.ApproveRosterRequestDocument,
    "mutation CancelMarket($marketID: ID!, $reason: CancellationReason!, $message: String, $endEarly: Boolean) {\n  cancelMarket(\n    marketID: $marketID\n    reason: $reason\n    message: $message\n    endEarly: $endEarly\n  ) {\n    id\n    status\n    cancellationReason\n    cancellationMessage\n    cancelledAt\n    updatedAt\n  }\n}": types.CancelMarketDocument,
    "mutation CreateMarket($input: CreateMarketInput!) {\n  createMarket(input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": types.CreateMarketDocument,
    "mutation CreateProduct($input: CreateProductInput!) {\n  createProduct(input: $input) {\n    id\n    vendorID\n    name\n    description\n    category\n    imageURL\n    isAvailable\n    createdAt\n    updatedAt\n  }\n}": types.CreateProductDocument,
    "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    user {\n      id\n      firebaseUID\n      email\n      displayName\n      role\n      createdAt\n    }\n  }\n}": types.CreateUserDocument,
    "mutation CreateVendorProfile($input: CreateVendorProfileInput!) {\n  createVendorProfile(input: $input) {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": types.CreateVendorProfileDocument,
    "mutation DeleteMarketSchedule($id: ID!) {\n  deleteMarketSchedule(id: $id)\n}": types.DeleteMarketScheduleDocument,
    "mutation DeleteProduct($id: ID!) {\n  deleteProduct(id: $id)\n}": types.DeleteProductDocument,
    "mutation Follow($targetType: FollowTargetType!, $targetID: ID!) {\n  follow(targetType: $targetType, targetID: $targetID) {\n    id\n    customerID\n    targetType\n    targetID\n    createdAt\n  }\n}": types.FollowDocument,
    "mutation InviteVendor($marketID: ID!, $vendorID: ID!, $targetDates: [String!], $message: String) {\n  inviteVendor(\n    marketID: $marketID\n    vendorID: $vendorID\n    targetDates: $targetDates\n    message: $message\n  ) {\n    id\n    status\n    createdAt\n  }\n}": types.InviteVendorDocument,
    "mutation ReactivateMarket($marketID: ID!) {\n  reactivateMarket(marketID: $marketID) {\n    id\n    status\n    updatedAt\n  }\n}": types.ReactivateMarketDocument,
    "mutation RegisterDeviceToken($input: RegisterDeviceTokenInput!) {\n  registerDeviceToken(input: $input) {\n    id\n    userID\n    token\n    platform\n    createdAt\n  }\n}": types.RegisterDeviceTokenDocument,
    "mutation RejectRosterRequest($id: ID!, $reason: String) {\n  rejectRosterRequest(id: $id, reason: $reason) {\n    id\n    status\n    rejectionReason\n    updatedAt\n  }\n}": types.RejectRosterRequestDocument,
    "mutation RemoveDeviceToken($tokenID: ID!) {\n  removeDeviceToken(tokenID: $tokenID)\n}": types.RemoveDeviceTokenDocument,
    "mutation RemoveVendorFromRoster($id: ID!) {\n  removeVendorFromRoster(id: $id)\n}": types.RemoveVendorFromRosterDocument,
    "mutation RequestToJoinMarket($marketID: ID!, $dates: [String!]!, $acknowledgeRules: Boolean!) {\n  requestToJoinMarket(\n    marketID: $marketID\n    dates: $dates\n    acknowledgeRules: $acknowledgeRules\n  ) {\n    id\n    marketID\n    vendorID\n    status\n    date\n    rulesAcknowledged\n    createdAt\n  }\n}": types.RequestToJoinMarketDocument,
    "mutation SendVendorNotification($marketID: ID!, $message: String!) {\n  sendVendorNotification(marketID: $marketID, message: $message) {\n    id\n    marketID\n    senderID\n    message\n    sentAt\n  }\n}": types.SendVendorNotificationDocument,
    "mutation Unfollow($targetType: FollowTargetType!, $targetID: ID!) {\n  unfollow(targetType: $targetType, targetID: $targetID)\n}": types.UnfollowDocument,
    "mutation UpdateMarket($id: ID!, $input: UpdateMarketInput!) {\n  updateMarket(id: $id, input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": types.UpdateMarketDocument,
    "mutation UpdateMarketRules($marketID: ID!, $rulesText: String!) {\n  updateMarketRules(marketID: $marketID, rulesText: $rulesText) {\n    id\n    rulesText\n    rulesUpdatedAt\n    updatedAt\n  }\n}": types.UpdateMarketRulesDocument,
    "mutation UpdateMarketSchedule($id: ID!, $input: UpdateScheduleInput!) {\n  updateMarketSchedule(id: $id, input: $input) {\n    id\n    marketID\n    scheduleType\n    dayOfWeek\n    frequency\n    seasonStart\n    seasonEnd\n    eventName\n    eventDate\n    startTime\n    endTime\n    label\n    createdAt\n    updatedAt\n  }\n}": types.UpdateMarketScheduleDocument,
    "mutation UpdateNotificationPrefs($input: UpdateNotificationPreferencesInput!) {\n  updateNotificationPreferences(input: $input) {\n    id\n    userID\n    pushEnabled\n    vendorCheckInAlerts\n    marketUpdateAlerts\n    exceptionAlerts\n    createdAt\n    updatedAt\n  }\n}": types.UpdateNotificationPrefsDocument,
    "mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {\n  updateProduct(id: $id, input: $input) {\n    id\n    vendorID\n    name\n    description\n    category\n    imageURL\n    isAvailable\n    createdAt\n    updatedAt\n  }\n}": types.UpdateProductDocument,
    "mutation UpdateVendorProfile($input: UpdateVendorProfileInput!) {\n  updateVendorProfile(input: $input) {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": types.UpdateVendorProfileDocument,
    "query ActivityFeed($limit: Int, $offset: Int) {\n  activityFeed(limit: $limit, offset: $offset) {\n    id\n    actorID\n    actionType\n    targetType\n    targetID\n    marketID\n    message\n    createdAt\n  }\n}": types.ActivityFeedDocument,
    "query DiscoverMarkets($latitude: Float!, $longitude: Float!, $radiusMiles: Float!, $limit: Int, $offset: Int) {\n  discoverMarkets(\n    latitude: $latitude\n    longitude: $longitude\n    radiusMiles: $radiusMiles\n    limit: $limit\n    offset: $offset\n  ) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    imageURL\n    status\n  }\n}": types.DiscoverMarketsDocument,
    "query DiscoverVendors($marketID: ID!, $limit: Int, $offset: Int) {\n  discoverVendors(marketID: $marketID, limit: $limit, offset: $offset) {\n    id\n    businessName\n    description\n    imageURL\n    products {\n      id\n      name\n      category\n      isAvailable\n    }\n  }\n}": types.DiscoverVendorsDocument,
    "query FollowingFeed($limit: Int, $offset: Int) {\n  followingFeed(limit: $limit, offset: $offset) {\n    id\n    type\n    vendor {\n      id\n      businessName\n      imageURL\n    }\n    market {\n      id\n      name\n      address\n    }\n    timestamp\n    message\n  }\n}": types.FollowingFeedDocument,
    "query GetMarket($id: ID!) {\n  market(id: $id) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    rulesText\n    rulesUpdatedAt\n    status\n    schedule {\n      id\n      scheduleType\n      dayOfWeek\n      startTime\n      endTime\n      seasonStart\n      seasonEnd\n      eventName\n      eventDate\n      label\n    }\n    createdAt\n    updatedAt\n  }\n}": types.GetMarketDocument,
    "query MarketActivityFeed($marketID: ID!, $limit: Int, $offset: Int) {\n  marketActivityFeed(marketID: $marketID, limit: $limit, offset: $offset) {\n    id\n    actorID\n    actionType\n    targetType\n    targetID\n    marketID\n    message\n    createdAt\n  }\n}": types.MarketActivityFeedDocument,
    "query MarketDayPlans($marketID: ID!, $startDate: String!, $endDate: String!) {\n  marketDayPlans(marketID: $marketID, startDate: $startDate, endDate: $endDate) {\n    date\n    vendorCount\n  }\n}": types.MarketDayPlansDocument,
    "query MarketRoster($marketID: ID!, $date: String!) {\n  marketRoster(marketID: $marketID, date: $date) {\n    id\n    marketID\n    vendorID\n    status\n    date\n    rulesAcknowledged\n    createdAt\n    updatedAt\n  }\n}": types.MarketRosterDocument,
    "query MyCustomerProfile {\n  myCustomerProfile {\n    id\n    userID\n    displayName\n    followedVendors {\n      id\n      businessName\n      imageURL\n    }\n    followedMarkets {\n      id\n      name\n      address\n    }\n    createdAt\n    updatedAt\n  }\n}": types.MyCustomerProfileDocument,
    "query MyMarkets {\n  myMarkets {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    imageURL\n    createdAt\n    updatedAt\n  }\n}": types.MyMarketsDocument,
    "query MyNotificationPrefs {\n  myNotificationPreferences {\n    id\n    userID\n    pushEnabled\n    vendorCheckInAlerts\n    marketUpdateAlerts\n    exceptionAlerts\n    createdAt\n    updatedAt\n  }\n}": types.MyNotificationPrefsDocument,
    "query MyVendorProfile {\n  myVendorProfile {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    products {\n      id\n      name\n      description\n      category\n      imageURL\n      isAvailable\n    }\n    createdAt\n    updatedAt\n  }\n}": types.MyVendorProfileDocument,
    "query SearchMarketsToJoin($input: SearchMarketsInput!) {\n  searchMarketsToJoin(input: $input) {\n    market {\n      id\n      name\n      description\n      address\n      latitude\n      longitude\n      contactEmail\n      contactPhone\n      rulesText\n      rulesUpdatedAt\n      status\n      schedule {\n        id\n        scheduleType\n        dayOfWeek\n        startTime\n        endTime\n        seasonStart\n        seasonEnd\n        eventName\n        eventDate\n        label\n      }\n    }\n    distanceKm\n    vendorCount\n    vendorStatus\n  }\n}": types.SearchMarketsToJoinDocument,
    "query Vendor($id: ID!) {\n  vendor(id: $id) {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    products {\n      id\n      name\n      description\n      category\n      imageURL\n      isAvailable\n    }\n    checkIns {\n      id\n      marketID\n      status\n      checkedInAt\n      checkedOutAt\n    }\n    createdAt\n    updatedAt\n  }\n}": types.VendorDocument,
    "query VendorMarkets {\n  vendorMarkets {\n    market {\n      id\n      name\n      address\n      status\n      schedule {\n        id\n        scheduleType\n        dayOfWeek\n        startTime\n        endTime\n      }\n    }\n    status\n    dates {\n      id\n      date\n      status\n    }\n    nextUpcomingDate\n  }\n}": types.VendorMarketsDocument,
    "query VendorProducts($vendorID: ID!) {\n  vendorProducts(vendorID: $vendorID) {\n    id\n    vendorID\n    name\n    description\n    category\n    imageURL\n    isAvailable\n    createdAt\n    updatedAt\n  }\n}": types.VendorProductsDocument,
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
export function graphql(source: "mutation CancelMarket($marketID: ID!, $reason: CancellationReason!, $message: String, $endEarly: Boolean) {\n  cancelMarket(\n    marketID: $marketID\n    reason: $reason\n    message: $message\n    endEarly: $endEarly\n  ) {\n    id\n    status\n    cancellationReason\n    cancellationMessage\n    cancelledAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation CancelMarket($marketID: ID!, $reason: CancellationReason!, $message: String, $endEarly: Boolean) {\n  cancelMarket(\n    marketID: $marketID\n    reason: $reason\n    message: $message\n    endEarly: $endEarly\n  ) {\n    id\n    status\n    cancellationReason\n    cancellationMessage\n    cancelledAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateMarket($input: CreateMarketInput!) {\n  createMarket(input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation CreateMarket($input: CreateMarketInput!) {\n  createMarket(input: $input) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateProduct($input: CreateProductInput!) {\n  createProduct(input: $input) {\n    id\n    vendorID\n    name\n    description\n    category\n    imageURL\n    isAvailable\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation CreateProduct($input: CreateProductInput!) {\n  createProduct(input: $input) {\n    id\n    vendorID\n    name\n    description\n    category\n    imageURL\n    isAvailable\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    user {\n      id\n      firebaseUID\n      email\n      displayName\n      role\n      createdAt\n    }\n  }\n}"): (typeof documents)["mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    user {\n      id\n      firebaseUID\n      email\n      displayName\n      role\n      createdAt\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateVendorProfile($input: CreateVendorProfileInput!) {\n  createVendorProfile(input: $input) {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation CreateVendorProfile($input: CreateVendorProfileInput!) {\n  createVendorProfile(input: $input) {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DeleteMarketSchedule($id: ID!) {\n  deleteMarketSchedule(id: $id)\n}"): (typeof documents)["mutation DeleteMarketSchedule($id: ID!) {\n  deleteMarketSchedule(id: $id)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DeleteProduct($id: ID!) {\n  deleteProduct(id: $id)\n}"): (typeof documents)["mutation DeleteProduct($id: ID!) {\n  deleteProduct(id: $id)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Follow($targetType: FollowTargetType!, $targetID: ID!) {\n  follow(targetType: $targetType, targetID: $targetID) {\n    id\n    customerID\n    targetType\n    targetID\n    createdAt\n  }\n}"): (typeof documents)["mutation Follow($targetType: FollowTargetType!, $targetID: ID!) {\n  follow(targetType: $targetType, targetID: $targetID) {\n    id\n    customerID\n    targetType\n    targetID\n    createdAt\n  }\n}"];
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
export function graphql(source: "mutation RegisterDeviceToken($input: RegisterDeviceTokenInput!) {\n  registerDeviceToken(input: $input) {\n    id\n    userID\n    token\n    platform\n    createdAt\n  }\n}"): (typeof documents)["mutation RegisterDeviceToken($input: RegisterDeviceTokenInput!) {\n  registerDeviceToken(input: $input) {\n    id\n    userID\n    token\n    platform\n    createdAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RejectRosterRequest($id: ID!, $reason: String) {\n  rejectRosterRequest(id: $id, reason: $reason) {\n    id\n    status\n    rejectionReason\n    updatedAt\n  }\n}"): (typeof documents)["mutation RejectRosterRequest($id: ID!, $reason: String) {\n  rejectRosterRequest(id: $id, reason: $reason) {\n    id\n    status\n    rejectionReason\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RemoveDeviceToken($tokenID: ID!) {\n  removeDeviceToken(tokenID: $tokenID)\n}"): (typeof documents)["mutation RemoveDeviceToken($tokenID: ID!) {\n  removeDeviceToken(tokenID: $tokenID)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RemoveVendorFromRoster($id: ID!) {\n  removeVendorFromRoster(id: $id)\n}"): (typeof documents)["mutation RemoveVendorFromRoster($id: ID!) {\n  removeVendorFromRoster(id: $id)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RequestToJoinMarket($marketID: ID!, $dates: [String!]!, $acknowledgeRules: Boolean!) {\n  requestToJoinMarket(\n    marketID: $marketID\n    dates: $dates\n    acknowledgeRules: $acknowledgeRules\n  ) {\n    id\n    marketID\n    vendorID\n    status\n    date\n    rulesAcknowledged\n    createdAt\n  }\n}"): (typeof documents)["mutation RequestToJoinMarket($marketID: ID!, $dates: [String!]!, $acknowledgeRules: Boolean!) {\n  requestToJoinMarket(\n    marketID: $marketID\n    dates: $dates\n    acknowledgeRules: $acknowledgeRules\n  ) {\n    id\n    marketID\n    vendorID\n    status\n    date\n    rulesAcknowledged\n    createdAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SendVendorNotification($marketID: ID!, $message: String!) {\n  sendVendorNotification(marketID: $marketID, message: $message) {\n    id\n    marketID\n    senderID\n    message\n    sentAt\n  }\n}"): (typeof documents)["mutation SendVendorNotification($marketID: ID!, $message: String!) {\n  sendVendorNotification(marketID: $marketID, message: $message) {\n    id\n    marketID\n    senderID\n    message\n    sentAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Unfollow($targetType: FollowTargetType!, $targetID: ID!) {\n  unfollow(targetType: $targetType, targetID: $targetID)\n}"): (typeof documents)["mutation Unfollow($targetType: FollowTargetType!, $targetID: ID!) {\n  unfollow(targetType: $targetType, targetID: $targetID)\n}"];
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
export function graphql(source: "mutation UpdateNotificationPrefs($input: UpdateNotificationPreferencesInput!) {\n  updateNotificationPreferences(input: $input) {\n    id\n    userID\n    pushEnabled\n    vendorCheckInAlerts\n    marketUpdateAlerts\n    exceptionAlerts\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation UpdateNotificationPrefs($input: UpdateNotificationPreferencesInput!) {\n  updateNotificationPreferences(input: $input) {\n    id\n    userID\n    pushEnabled\n    vendorCheckInAlerts\n    marketUpdateAlerts\n    exceptionAlerts\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {\n  updateProduct(id: $id, input: $input) {\n    id\n    vendorID\n    name\n    description\n    category\n    imageURL\n    isAvailable\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {\n  updateProduct(id: $id, input: $input) {\n    id\n    vendorID\n    name\n    description\n    category\n    imageURL\n    isAvailable\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateVendorProfile($input: UpdateVendorProfileInput!) {\n  updateVendorProfile(input: $input) {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["mutation UpdateVendorProfile($input: UpdateVendorProfileInput!) {\n  updateVendorProfile(input: $input) {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ActivityFeed($limit: Int, $offset: Int) {\n  activityFeed(limit: $limit, offset: $offset) {\n    id\n    actorID\n    actionType\n    targetType\n    targetID\n    marketID\n    message\n    createdAt\n  }\n}"): (typeof documents)["query ActivityFeed($limit: Int, $offset: Int) {\n  activityFeed(limit: $limit, offset: $offset) {\n    id\n    actorID\n    actionType\n    targetType\n    targetID\n    marketID\n    message\n    createdAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query DiscoverMarkets($latitude: Float!, $longitude: Float!, $radiusMiles: Float!, $limit: Int, $offset: Int) {\n  discoverMarkets(\n    latitude: $latitude\n    longitude: $longitude\n    radiusMiles: $radiusMiles\n    limit: $limit\n    offset: $offset\n  ) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    imageURL\n    status\n  }\n}"): (typeof documents)["query DiscoverMarkets($latitude: Float!, $longitude: Float!, $radiusMiles: Float!, $limit: Int, $offset: Int) {\n  discoverMarkets(\n    latitude: $latitude\n    longitude: $longitude\n    radiusMiles: $radiusMiles\n    limit: $limit\n    offset: $offset\n  ) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    imageURL\n    status\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query DiscoverVendors($marketID: ID!, $limit: Int, $offset: Int) {\n  discoverVendors(marketID: $marketID, limit: $limit, offset: $offset) {\n    id\n    businessName\n    description\n    imageURL\n    products {\n      id\n      name\n      category\n      isAvailable\n    }\n  }\n}"): (typeof documents)["query DiscoverVendors($marketID: ID!, $limit: Int, $offset: Int) {\n  discoverVendors(marketID: $marketID, limit: $limit, offset: $offset) {\n    id\n    businessName\n    description\n    imageURL\n    products {\n      id\n      name\n      category\n      isAvailable\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query FollowingFeed($limit: Int, $offset: Int) {\n  followingFeed(limit: $limit, offset: $offset) {\n    id\n    type\n    vendor {\n      id\n      businessName\n      imageURL\n    }\n    market {\n      id\n      name\n      address\n    }\n    timestamp\n    message\n  }\n}"): (typeof documents)["query FollowingFeed($limit: Int, $offset: Int) {\n  followingFeed(limit: $limit, offset: $offset) {\n    id\n    type\n    vendor {\n      id\n      businessName\n      imageURL\n    }\n    market {\n      id\n      name\n      address\n    }\n    timestamp\n    message\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetMarket($id: ID!) {\n  market(id: $id) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    rulesText\n    rulesUpdatedAt\n    status\n    schedule {\n      id\n      scheduleType\n      dayOfWeek\n      startTime\n      endTime\n      seasonStart\n      seasonEnd\n      eventName\n      eventDate\n      label\n    }\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query GetMarket($id: ID!) {\n  market(id: $id) {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    socialLinks {\n      instagram\n      facebook\n      website\n      twitter\n    }\n    imageURL\n    rulesText\n    rulesUpdatedAt\n    status\n    schedule {\n      id\n      scheduleType\n      dayOfWeek\n      startTime\n      endTime\n      seasonStart\n      seasonEnd\n      eventName\n      eventDate\n      label\n    }\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query MarketActivityFeed($marketID: ID!, $limit: Int, $offset: Int) {\n  marketActivityFeed(marketID: $marketID, limit: $limit, offset: $offset) {\n    id\n    actorID\n    actionType\n    targetType\n    targetID\n    marketID\n    message\n    createdAt\n  }\n}"): (typeof documents)["query MarketActivityFeed($marketID: ID!, $limit: Int, $offset: Int) {\n  marketActivityFeed(marketID: $marketID, limit: $limit, offset: $offset) {\n    id\n    actorID\n    actionType\n    targetType\n    targetID\n    marketID\n    message\n    createdAt\n  }\n}"];
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
export function graphql(source: "query MyCustomerProfile {\n  myCustomerProfile {\n    id\n    userID\n    displayName\n    followedVendors {\n      id\n      businessName\n      imageURL\n    }\n    followedMarkets {\n      id\n      name\n      address\n    }\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query MyCustomerProfile {\n  myCustomerProfile {\n    id\n    userID\n    displayName\n    followedVendors {\n      id\n      businessName\n      imageURL\n    }\n    followedMarkets {\n      id\n      name\n      address\n    }\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query MyMarkets {\n  myMarkets {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query MyMarkets {\n  myMarkets {\n    id\n    name\n    description\n    address\n    latitude\n    longitude\n    contactEmail\n    contactPhone\n    imageURL\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query MyNotificationPrefs {\n  myNotificationPreferences {\n    id\n    userID\n    pushEnabled\n    vendorCheckInAlerts\n    marketUpdateAlerts\n    exceptionAlerts\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query MyNotificationPrefs {\n  myNotificationPreferences {\n    id\n    userID\n    pushEnabled\n    vendorCheckInAlerts\n    marketUpdateAlerts\n    exceptionAlerts\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query MyVendorProfile {\n  myVendorProfile {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    products {\n      id\n      name\n      description\n      category\n      imageURL\n      isAvailable\n    }\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query MyVendorProfile {\n  myVendorProfile {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    products {\n      id\n      name\n      description\n      category\n      imageURL\n      isAvailable\n    }\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query SearchMarketsToJoin($input: SearchMarketsInput!) {\n  searchMarketsToJoin(input: $input) {\n    market {\n      id\n      name\n      description\n      address\n      latitude\n      longitude\n      contactEmail\n      contactPhone\n      rulesText\n      rulesUpdatedAt\n      status\n      schedule {\n        id\n        scheduleType\n        dayOfWeek\n        startTime\n        endTime\n        seasonStart\n        seasonEnd\n        eventName\n        eventDate\n        label\n      }\n    }\n    distanceKm\n    vendorCount\n    vendorStatus\n  }\n}"): (typeof documents)["query SearchMarketsToJoin($input: SearchMarketsInput!) {\n  searchMarketsToJoin(input: $input) {\n    market {\n      id\n      name\n      description\n      address\n      latitude\n      longitude\n      contactEmail\n      contactPhone\n      rulesText\n      rulesUpdatedAt\n      status\n      schedule {\n        id\n        scheduleType\n        dayOfWeek\n        startTime\n        endTime\n        seasonStart\n        seasonEnd\n        eventName\n        eventDate\n        label\n      }\n    }\n    distanceKm\n    vendorCount\n    vendorStatus\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Vendor($id: ID!) {\n  vendor(id: $id) {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    products {\n      id\n      name\n      description\n      category\n      imageURL\n      isAvailable\n    }\n    checkIns {\n      id\n      marketID\n      status\n      checkedInAt\n      checkedOutAt\n    }\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query Vendor($id: ID!) {\n  vendor(id: $id) {\n    id\n    userID\n    businessName\n    description\n    contactInfo\n    instagramHandle\n    facebookURL\n    websiteURL\n    imageURL\n    products {\n      id\n      name\n      description\n      category\n      imageURL\n      isAvailable\n    }\n    checkIns {\n      id\n      marketID\n      status\n      checkedInAt\n      checkedOutAt\n    }\n    createdAt\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query VendorMarkets {\n  vendorMarkets {\n    market {\n      id\n      name\n      address\n      status\n      schedule {\n        id\n        scheduleType\n        dayOfWeek\n        startTime\n        endTime\n      }\n    }\n    status\n    dates {\n      id\n      date\n      status\n    }\n    nextUpcomingDate\n  }\n}"): (typeof documents)["query VendorMarkets {\n  vendorMarkets {\n    market {\n      id\n      name\n      address\n      status\n      schedule {\n        id\n        scheduleType\n        dayOfWeek\n        startTime\n        endTime\n      }\n    }\n    status\n    dates {\n      id\n      date\n      status\n    }\n    nextUpcomingDate\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query VendorProducts($vendorID: ID!) {\n  vendorProducts(vendorID: $vendorID) {\n    id\n    vendorID\n    name\n    description\n    category\n    imageURL\n    isAvailable\n    createdAt\n    updatedAt\n  }\n}"): (typeof documents)["query VendorProducts($vendorID: ID!) {\n  vendorProducts(vendorID: $vendorID) {\n    id\n    vendorID\n    name\n    description\n    category\n    imageURL\n    isAvailable\n    createdAt\n    updatedAt\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;