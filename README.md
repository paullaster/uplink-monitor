# uplink-monitor
# This Uplink-monitor API does the following
  1. The API Listens on a PORT and accepts incomming HTTP/HTTPS request for POST,GET,PUT, DELETE, and HEAD
  2. The API allow clients to connect to it, then create new user, edit the user  and delete the user
 3.  The API allow users to 'sign in', which gives them a token that they can use for subsequent authenticated requests.
 4.  The API allow users to 'sign out ', which invalidates the token
 5. The API allows the signed in user to use their token to create a new "Check"
 6. The  API allows the signe in user to edit or delete any of their "checks"