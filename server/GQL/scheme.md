## GraphQL Scheme Documentation

#### Student Model
```
type Student {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  _id: string
  auth_info: AuthInfo
}

/**
* AuthInfo: Information needed for students
* to authenticate the application.
*/
type AuthInfo {
  cas_id: string
  institution_id: ID
}
```