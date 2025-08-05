# Database Connection Troubleshooting Guide

This guide helps you resolve database connection issues with Supabase and Prisma.

## 🔍 Quick Diagnosis

Run the database connection test:

```bash
npm run test:db
```

This will check your environment variables and test the connection.

## 🚨 Common Issues & Solutions

### 1. Missing Environment Variables

**Error**: `DATABASE_URL environment variable is required`

**Solution**:
1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Get your Supabase connection string:
   - Go to your Supabase project dashboard
   - Navigate to Settings → Database
   - Copy the "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your database password

3. Update your `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

### 2. Authentication Failed

**Error**: `authentication failed for user "postgres"`

**Solutions**:
1. **Check password**: Ensure you're using the correct database password from Supabase
2. **Reset password**: In Supabase dashboard → Settings → Database → Reset password
3. **Check connection string**: Make sure the password is properly URL-encoded

### 3. Connection Refused

**Error**: `connection refused` or `ECONNREFUSED`

**Solutions**:
1. **Check Supabase status**: Visit https://status.supabase.com
2. **Verify project**: Ensure your Supabase project is active
3. **Check IP restrictions**: In Supabase → Settings → Database → Connection pooling
4. **Try direct connection**: Use the direct connection string instead of pooling

### 4. Database Not Found

**Error**: `database "postgres" does not exist`

**Solutions**:
1. **Check database name**: Should be `postgres` for Supabase
2. **Verify project**: Ensure you're using the correct project reference
3. **Check URL format**: Should be `postgresql://postgres:password@host:5432/postgres`

### 5. Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npm run prisma:generate
```

### 6. Schema Not Found

**Error**: `relation "users" does not exist`

**Solution**:
```bash
npm run prisma:migrate
```

## 🔧 Step-by-Step Setup

### 1. Supabase Setup

1. **Create a new project** at https://supabase.com
2. **Get connection details**:
   - Go to Settings → Database
   - Copy the connection string
   - Note your database password

### 2. Environment Configuration

1. **Create `.env` file**:
   ```bash
   cp env.example .env
   ```

2. **Add your Supabase credentials**:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
   SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
   ```

### 3. Database Setup

1. **Generate Prisma client**:
   ```bash
   npm run prisma:generate
   ```

2. **Run migrations**:
   ```bash
   npm run prisma:migrate
   ```

3. **Seed the database** (optional):
   ```bash
   npm run db:seed
   ```

### 4. Test Connection

```bash
npm run test:db
```

## 🛠️ Advanced Troubleshooting

### Check Supabase Connection String Format

Your DATABASE_URL should look like this:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

**Components**:
- `postgresql://` - Protocol
- `postgres` - Username (always "postgres" for Supabase)
- `[YOUR-PASSWORD]` - Database password
- `db.[YOUR-PROJECT-REF].supabase.co` - Host
- `5432` - Port (always 5432 for Supabase)
- `postgres` - Database name (always "postgres" for Supabase)

### Test with psql (Optional)

If you have PostgreSQL client installed:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### Check Network Connectivity

```bash
# Test if you can reach Supabase
ping db.[YOUR-PROJECT-REF].supabase.co

# Test port connectivity
telnet db.[YOUR-PROJECT-REF].supabase.co 5432
```

### Enable Debug Logging

Add to your `.env`:
```env
DEBUG=prisma:*
```

## 📞 Getting Help

If you're still having issues:

1. **Check the error logs** from `npm run test:db`
2. **Verify your Supabase project** is active and running
3. **Check Supabase status** at https://status.supabase.com
4. **Review the error message** and match it to the solutions above

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Use environment variables in production
- Consider using connection pooling for production
- Regularly rotate your database passwords

## 🚀 Production Deployment

For production, consider:

1. **Connection pooling**: Use Supabase's connection pooling
2. **Environment variables**: Set via your hosting platform
3. **SSL**: Ensure SSL connections are enabled
4. **IP restrictions**: Configure allowed IPs in Supabase 