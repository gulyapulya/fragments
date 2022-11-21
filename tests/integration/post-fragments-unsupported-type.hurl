# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a css text fragment
Content-Type: text/css
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
```This is a css!```

# 1. We expect to get back an HTTP 415
HTTP/1.1 415

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" isString
jsonpath "$.error.message" == "This type is not supported"
jsonpath "$.error.code" == 415
