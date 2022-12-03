# Authenticated POST json to /v1/fragments

POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{ "service": "DynamoDB" }

HTTP/1.1 201

[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.created" isString 
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.size" == 25
jsonpath "$.fragment.type" == "application/json"


# Authenticated POST markdown to /v1/fragments

POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
```DynamoDB is **great**.```

HTTP/1.1 201

[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.created" isString 
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.size" == 22
jsonpath "$.fragment.type" == "text/markdown"


# Authenticated GET to /v1/fragments

GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}


# Authenticated DELETE to fragment1_url

DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"

GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404


# Authenticated GET to /v1/fragments

GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" not includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}
