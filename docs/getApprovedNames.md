## Get Approved Names API

### Overview
Fetch approved contributor names from the `names` table.

### Endpoint
- Method: GET
- Path: `/api/getApprovedNames`

### Authentication
- Required header: `api_key: YOUR_SERVER_API_KEY` (or `x-api-key`)

### CORS
- Supports `GET` and `OPTIONS` (preflight)

### Query Parameters
- None

### Response
- 200 OK:
```json
{
  "data": [
    { "name": "Alice" },
    { "name": "Bob" }
  ]
}
```
- 403 Forbidden (missing/invalid API key)
- 405 Method Not Allowed
- 500 Server error: `{ "error": string }`

Notes:
- Results include only rows where `approved` is `true`
- Sorted ascending by `name`

### Minimal Example
```bash
curl -X GET "https://your-app.example.com/api/getApprovedNames" \
  -H "api_key: $SERVER_API_KEY"
```

### JavaScript (fetch) Example
```javascript
const res = await fetch("/api/getApprovedNames", {
  headers: { "api_key": process.env.SERVER_API_KEY }
});
const { data } = await res.json();
// data is an array of { name }
```


