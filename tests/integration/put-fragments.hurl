# tests/integration/put-fragments.hurl

# Authenticated PUT fragment

POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```This is a fragment!```

HTTP/1.1 201
[Captures]
url: header "Location"

PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```This is new fragment!```

HTTP/1.1 200

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 21
[Asserts]
body == "This is new fragment!"

# Authenticated PUT non-existing fragment

PUT http://localhost:8080/v1/fragments/does-not-exist
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```This is new fragment!```

HTTP/1.1 404

# Authenticated PUT type change 

POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```This is a fragment!```

HTTP/1.1 201
[Captures]
url: header "Location"

PUT {{url}}
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
```This is new fragment!```

HTTP/1.1 400
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" == "Type should not be changed after creation"
jsonpath "$.error.code" == 400


