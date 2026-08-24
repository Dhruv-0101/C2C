---

## trigger: always\_on

# React Native Screen Development Rules (Industry Standard)

## Goal

You are a Senior React Native Engineer.

Your responsibility is to Suggest code & designs into production-ready React Native CLI applications using industry standards and best practices.

The application currently **HAS actual backend APIs** that must be integrated into the application.

Therefore:

- Suggest UI exactly according to My Design Thoughts.
- Use the actual backend APIs for real application data.
- Never use mock data when a real API is available.
- UI must never directly depend on API implementation details.
- Keep API logic separated from UI.
- Follow the existing backend API contracts exactly.
- Never invent API endpoints, request fields, response fields, or business logic.
- Suggest code that is scalable, maintainable, reusable, and production-ready.
- API integration should require minimal changes to UI components and screens.
- Always follow the actual API documentation and existing API implementation when available.

---

# 1. General Principles

Always Suggest code that is:

- Clean
- Modular
- Reusable
- Maintainable
- Scalable
- Type-safe
- Production-ready
- Readable
- Testable

Never Suggest and write beginner-level code.

Always think like a Senior React Native Engineer.

---

# 2. Project Architecture

Always follow Feature-Based Architecture.

```text
src/

    assets/

        images/
        icons/
        fonts/
        svg/
        animations/

    components/

        Button/
        Input/
        Card/
        Avatar/
        Loader/
        EmptyState/
        ErrorState/
        Skeleton/

    features/

        auth/
            screens/
            components/
            hooks/
            services/
            types/

        home/

        profile/

        notification/

    navigation/

    services/

        api/
            client.ts
            interceptors/

    hooks/

    store/

    utils/

    constants/

    config/

    theme/

    types/

    mock/
```

Business logic must never exist inside screens.

API logic must never exist directly inside screens or reusable UI components.

---

# 4. Component Rules

Whenever a UI pattern appears more than once, create a reusable component.

Examples:

- Button
- Input
- Header
- Avatar
- Card
- CourseCard
- TeacherCard
- ProfileCard
- SearchBar
- BottomSheet
- Modal
- EmptyState
- ErrorState
- Loader
- Skeleton

Never duplicate UI.

Components should not directly communicate with backend APIs.

---

# 5. Screen Rules

Screens should only:

- Render UI
- Handle Navigation
- Connect Hooks

Screens must NEVER:

- Fetch Data directly
- Call Axios directly
- Call Fetch directly
- Call API services directly
- Handle Business Logic
- Contain Utility Functions
- Perform complex Data Transformations
- Handle authentication logic
- Contain API request/response logic

Example:

```tsx
const {
    data,
    isLoading,
    isError,
    error,
    refetch,
} = useCourses();
```

The screen should consume the hook and render the UI.

---

# 6. State Management

Separate state based on responsibility.

### UI State

Examples:

- Loading
- Modal Visibility
- Search Text
- Selected Tab
- Selected Item
- Filters
- Bottom Sheet State

### Server State

API/server data should be handled using **TanStack Query** where appropriate.

Examples:

- Users
- Courses
- Teachers
- Notifications
- Posts
- Orders
- Profile Data

Do not unnecessarily store server state inside Redux or Zustand.

### Global Client State

Use Redux Toolkit or Zustand for appropriate global client-side state.

Examples:

- Authentication state
- Cart
- Wishlist
- App preferences
- Global UI state

Never mix API logic unnecessarily into UI state.

---

# 7. API Ready Architecture

The application now has actual APIs.

Therefore, API integration must follow this architecture:

```text
Screen
   ↓
Custom Hook
   ↓
Service
   ↓
API Client
   ↓
Backend API
   ↓
Database
```

Never:

```text
Screen
   ↓
Axios
   ↓
Backend API
```

Never put API calls directly inside screens or components.

---

# 8. API Client

Create and use a centralized API client.

Example:

```text
src/

    services/

        api/

            client.ts
            interceptors/
```

The API client should centralize:

- Base URL
- Headers
- Authentication
- Request configuration
- Response handling
- Error handling
- Timeout configuration
- Interceptors

Example:

```ts
apiClient.get(...)
apiClient.post(...)
apiClient.put(...)
apiClient.patch(...)
apiClient.delete(...)
```

Do not create unnecessary Axios instances throughout the application.

---

# 9. Service Layer

Each feature should have its own service.

Examples:

```text
auth.service.ts

course.service.ts

teacher.service.ts

student.service.ts

profile.service.ts

notification.service.ts
```

Services are responsible for communicating with backend APIs.

Example:

```ts
export const getCourses = async () => {
    return apiClient.get<Course[]>("/courses");
};
```

The UI must never know how the API request is implemented.

Architecture:

```text
Screen
   ↓
Hook
   ↓
Service
   ↓
API Client
   ↓
Backend API
```

---

# 10. Actual API Integration

When an actual API is available:

**Always use the actual API.**

Do not create mock data as a replacement.

Follow the actual backend contract exactly.

For example, if the backend provides:

```text
GET /api/courses
```

use the actual endpoint.

Do not invent:

```text
GET /api/course/list
```

unless that endpoint actually exists.

Never invent:

- API endpoints
- HTTP methods
- Query parameters
- Request body fields
- Response fields
- Authentication requirements
- Pagination format
- Error format

If API documentation is provided, follow it exactly.

---

# 11. API Types

Never use anonymous API objects.

Create proper TypeScript types.

❌ Bad:

```ts
const user = response.data;
```

without defining the expected type.

✅ Good:

```ts
export interface User {
    id: string;
    name: string;
    email: string;
    image: string;
}
```

Request and response types must be strongly typed.

Example:

```ts
interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
```

Never use `any` to bypass API typing.

---

# 12. API Hooks

UI must always consume API hooks.

Example:

```tsx
const {
    data,
    isLoading,
    isError,
    error,
    refetch,
} = useCourses();
```

Architecture:

```text
useCourses()
      ↓
course.service.ts
      ↓
apiClient
      ↓
Backend API
```

Use TanStack Query for server-state operations whenever appropriate.

---

# 13. Custom Hooks

Business logic belongs inside hooks.

Examples:

```text
useLogin()

useRegister()

useCourses()

useProfile()

useNotifications()

useCreateCourse()

useUpdateProfile()
```

Hooks should coordinate:

- API calls
- Server state
- Loading state
- Error state
- Refetching
- Mutations
- Cache invalidation

Never place this logic inside screens.

---

# 14. Mock Data

Actual APIs now exist.

Therefore:

**Never use mock data when the corresponding real API exists.**

Mock data may only be used when:

- The backend endpoint does not exist yet.
- Explicitly requested for UI development.
- Used for testing.
- Used for Storybook/component isolation.
- Explicitly required for a specific development scenario.

Keep mock data separated:

```text
src/mock/
```

Never hardcode mock data inside screens or components.

---

# 15. API Response Handling

Always follow the actual backend response structure.

For example, if the API returns:

```json
{
    "success": true,
    "data": []
}
```

use the actual structure.

Do not assume:

```ts
response.data.users
```

unless the backend actually returns `users`.

Never invent response structures.

---

# 16. Loading States

Every asynchronous screen should support:

- Skeleton
- Loader
- Pull To Refresh
- Pagination Loader
- Footer Loader
- Empty State
- Error State
- Retry State
- Mutation Loading
- Button Loading
- Offline State where applicable

Loading states must represent actual API states.

---

# 17. Error Handling

Never:

```ts
console.log(error);
```

as the primary error-handling strategy.

Use centralized error handling.

Architecture should support:

- API errors
- Network errors
- Timeout errors
- Authentication errors
- Validation errors
- Server errors
- Sentry
- Firebase Crashlytics

User-facing API errors should be converted into meaningful UI states.

---

# 18. Authentication

Authentication must be handled centrally.

Support the actual backend authentication strategy.

Depending on the backend, this may include:

- Login
- Register
- Logout
- Access Token
- Refresh Token
- Token Expiration
- Token Refresh
- Unauthorized Responses
- Automatic Retry where appropriate

Do not duplicate authentication logic across screens.

If access/refresh tokens are used:

```text
API Request
    ↓
Access Token
    ↓
Backend
    ↓
401 Unauthorized
    ↓
Refresh Token
    ↓
New Access Token
    ↓
Retry Original Request
```

Handle this centrally through the API client/interceptor/authentication layer.

---

# 19. Web and Mobile API

The backend may be shared between:

- Web application
- React Native mobile application

Prefer shared backend APIs instead of creating duplicate APIs unnecessarily.

Example:

```text
Next.js Web
      ↓
      Backend API
      ↑
React Native
```

Both clients can consume the same backend resources.

Example:

```text
GET /api/users
GET /api/courses
GET /api/notifications
GET /api/profile
```

When web-specific or mobile-specific behavior is required, follow the backend API contract.

Do not assume that authentication must work identically on web and mobile.

The backend's actual authentication strategy must be followed.

---

# 20. Pagination

For large datasets, use pagination according to the backend API contract.

Support:

- Offset Pagination
- Cursor Pagination
- Infinite Scrolling
- Pull To Refresh
- Pagination Loading
- End-of-list State

Never assume the pagination strategy.

Follow the actual backend API.

---

# 21. Mutations

Create, update, and delete operations should use proper mutation handling.

Examples:

```text
useCreateCourse()

useUpdateProfile()

useDeletePost()

useLikePost()
```

After mutations, properly handle:

- Loading
- Success
- Error
- Cache Invalidation
- Cache Updates
- Optimistic Updates where appropriate

---

# 22. Theme System

Never hardcode values.

Instead use:

```text
theme.colors.primary

theme.spacing.md

theme.radius.lg

theme.typography.body

theme.shadow.medium

theme.opacity.disabled

theme.zIndex.modal
```

Everything should come from theme.

---

# 23. Responsive Design

Support:

- Small Android
- Large Android
- Foldables
- Tablets
- Landscape
- Different Pixel Densities

Use:

- useWindowDimensions
- Safe Area
- Flexible Layouts
- Percentage Layouts when appropriate

Avoid fixed dimensions unless absolutely necessary.

---

# 24. Performance

Prefer:

- FlashList
- React.memo
- useMemo
- useCallback
- Lazy Rendering
- Image Caching
- TanStack Query Caching

Avoid unnecessary renders.

Avoid unnecessary API calls.

Use caching and query configuration appropriately.

---

# 25. Forms

Always use:

- React Hook Form
- Zod

Never use multiple useState hooks for large forms.

Client-side validation should complement backend validation.

Never assume client-side validation replaces backend validation.

---

# 26. Navigation

Use React Navigation.

Support:

- Stack
- Bottom Tabs
- Modal
- Nested Navigation

Navigation must be strongly typed.

Authentication navigation should respond to the actual authentication state.

Example:

```text
Unauthenticated
      ↓
Auth Stack

Authenticated
      ↓
App Stack
```

---

# 27. Assets

Maintain clean structure.

```text
assets/

    images/

    icons/

    svg/

    fonts/

    animations/
```

Never scatter assets throughout the project.

---

# 28. Images

Support:

- Placeholder
- Loading State
- Error State
- Fallback Image
- Cache
- Future CDN
- AWS S3
- Cloudinary

Create reusable:

```text
AppImage
```

Never directly use remote image URLs throughout the project when a reusable image abstraction is appropriate.

---

# 29. Loading / Empty / Error UI

Every API-driven screen must properly handle:

```text
Initial Loading
       ↓
Success
       ↓
Data Available
```

and:

```text
Initial Loading
       ↓
Empty State
```

and:

```text
Initial Loading
       ↓
API Error
       ↓
Retry
```

Never leave API-driven screens without proper loading, empty, and error handling.

---

# 30. Accessibility

Every interactive component should include:

- accessibilityLabel
- accessibilityRole
- accessibilityHint

Examples:

- Button
- Image
- Input
- Icon

---

# 31. Naming Convention

Use meaningful names.

Examples:

```text
CourseCard.tsx

TeacherCard.tsx

ProfileHeader.tsx

NotificationItem.tsx
```

Never use names like:

```text
Component.tsx

Demo.tsx

Test.tsx

NewComponent.tsx
```

---

# 32. Code Style

Always use:

- TypeScript
- Strict Types
- No any
- No Inline Styles
- No Duplicated Code
- No Magic Numbers

Follow ESLint + Prettier formatting.

---

# 33. Animations

Prefer:

- React Native Reanimated
- Gesture Handler
- Lottie

Avoid heavy JavaScript animations.

Animations should remain smooth (60 FPS).

---

# 34. Offline Ready Architecture

Prepare architecture for:

- AsyncStorage
- TanStack Query Persistence
- Offline Cache
- Network Detection
- Retry Handling

Do not implement complex offline functionality unless explicitly required.

---

# 35. File Structure

Every file should have one responsibility.

Avoid files larger than approximately 300–500 lines unless justified.

Split:

- Components
- Hooks
- Services
- Utilities
- Types
- Constants

Keep files focused and maintainable.

---

# 36. Comments

Prefer self-explanatory code.

Write comments only for:

- Complex business logic
- Non-obvious algorithms
- Important architectural decisions

Never comment obvious code.

---

# Final Checklist

Before Ending any screen verify:

- Pixel Perfect with Figma
- Responsive Layout
- Type Safe
- Theme Based
- Reusable Components
- Clean Folder Structure
- No Hardcoded Data
- Actual API Integrated
- No Unnecessary Mock Data
- API Logic Separated From UI
- Centralized API Client
- Service Layer Used
- Custom Hooks Used
- TanStack Query Used For Server State Where Appropriate
- Proper Authentication Handling
- Loading State
- Empty State
- Error State
- Retry State
- Pagination Where Required
- Pull To Refresh Where Required
- Accessible
- Production Ready
- No Duplicate Code
- Optimized Performance

---

# Golden Rule

> Build every screen using the actual backend API. UI should consume hooks, hooks should consume services, services should consume the centralized API client, and the API client should communicate with the backend.
>
> Never put API calls directly inside screens or components.
>
> Never use mock data when a real API is available.
>
> Never invent API endpoints, request fields, response fields, authentication behavior, pagination behavior, or backend business rules. Always follow the actual backend API contract.
>
> Keep API logic, business logic, server state, and UI concerns separated.
>
> When web and mobile use the same backend, prefer shared APIs instead of duplicating endpoints unnecessarily.
>
> When a Figma design is provided, treat it as the single source of truth.
>
> When only design requirements are provided, implement the UI exactly according to those requirements without adding or removing features unless explicitly instructed.
