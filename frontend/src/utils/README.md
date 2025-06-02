# Utils Directory

The `utils` directory contains utility functions, services, and abstractions used throughout the application. This document outlines the structure and purpose of each subdirectory.

## Directory Structure

```
utils/
├── apiClient.ts            # Main API client with authentication and request handling
├── cache/                  # Caching mechanisms
│   └── requestCache.ts     # Request caching for API optimization
├── config/                 # Configuration files
│   ├── apiRoutes.ts        # API endpoint definitions
│   └── environment.ts      # Environment configuration
├── helpers/                # General utility functions
│   ├── index.ts            # Common helper functions
│   └── requestControl.ts   # Request debouncing and throttling utilities
├── interfaces/             # TypeScript interfaces
│   ├── college/            # College-related interfaces
│   ├── users/              # User-related interfaces
│   └── utilities/          # Miscellaneous interfaces
├── logging/                # Logging utilities
│   └── logger.ts           # Centralized logger with different log levels
├── services/               # Service layer for API communication
│   ├── baseService.ts      # Base service with common CRUD operations
│   ├── college/            # College-related services
│   ├── users/              # User-related services
│   └── utilities/          # Miscellaneous services
└── stores/                 # Pinia stores for state management
    ├── base/               # Base store types and utilities
    ├── college/            # College-related stores
    ├── users/              # User-related stores
    └── utilities/          # Miscellaneous stores
```

## Key Features and Optimizations

### API Client Optimizations

- **Request Caching**: Implemented caching for GET requests to reduce redundant API calls
- **Error Handling**: Enhanced error tracking and reporting
- **Token Management**: Improved JWT token handling with automatic refresh
- **Request Processing**: URL normalization and duplicate prefix prevention
- **Cache Invalidation**: Automatic cache invalidation on data modification

### Performance Improvements

- **Debouncing & Throttling**: Control request frequency for search inputs and form submissions
- **Retry Mechanism**: Automatic retry for failed network requests with exponential backoff
- **Memoization**: Cache expensive computations to avoid redundant processing

### Development Experience

- **Structured Logging**: Centralized logging with configurable levels and contexts
- **Environment Configuration**: Centralized configuration for different environments
- **Consistent Error Handling**: Standardized error handling across the application

### Code Organization

- **Service Layer**: Abstracted API communication into domain-specific services
- **Type Safety**: Enhanced TypeScript interfaces for better type checking
- **Modular Structure**: Organized by domain for better maintainability

## Usage Examples

### API Client

```typescript
import apiClient from '@/utils/apiClient';

// Making a GET request with automatic caching
const response = await apiClient.get('/api/users/123');

// Making a POST request that automatically invalidates related caches
await apiClient.post('/api/users', { name: 'New User' });
```

### Utilities

```typescript
import { debounce, retry } from '@/utils/helpers/requestControl';
import { formatDate, groupBy } from '@/utils/helpers';
import logger from '@/utils/logging/logger';

// Debounced search function
const debouncedSearch = debounce((term) => {
  // Search logic here
}, 300);

// Using helper functions
const formattedDate = formatDate('2023-01-01');
const groupedData = groupBy(items, 'category');

// Using the logger
logger.info('Operation completed', { details: 'Additional context' });
```

### Services

```typescript
import { UserService } from '@/utils/services/users/userService';

const userService = new UserService();
const users = await userService.getUsers({ department: 'IT' });
```

## Best Practices

1. **Always use services** instead of direct API calls in components
2. **Use the logger** for all logging needs instead of console.log
3. **Leverage helper functions** for common operations
4. **Use environment configuration** instead of hardcoded values 