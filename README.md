### Koa backend server template

- koa router with some test routes
- plachehold login function that generates a JWT
    - requires env variable `JWT_SECRET` to be set, use a UUID4 or something
- middleware to verify JWTs
- custom errors
- catch-all route for bad calls in /api/
- catch-all to serve ../frontend/dist from the root
- winston logging
