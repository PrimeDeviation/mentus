Active File


GET
/active/
Return the content of the active file open in Obsidian.

Returns the content of the currently active file in Obsidian.

If you specify the header Accept: application/vnd.olrapi.note+json, will return a JSON representation of your note including parsed tag and frontmatter data as well as filesystem metadata. See "responses" below for details.

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Success

Media type

text/markdown
Controls Accept header.
Example Value
Schema
# This is my document

something else here

No links
404	
File does not exist

No links

PUT
/active/
Update the content of the active file open in Obsidian.

Parameters
Try it out
No parameters

Request body

text/markdown
Content of the file you would like to upload.

Example Value
Schema
# This is my document

something else here

Responses
Code	Description	Links
204	
Success

No links
400	
Incoming file could not be processed. Make sure you have specified a reasonable file name, and make sure you have set a reasonable 'Content-Type' header; if you are uploading a note, 'text/markdown' is likely the right choice.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
405	
Your path references a directory instead of a file; this request method is valid only for updating files.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links

POST
/active/
Append content to the active file open in Obsidian.

Appends content to the end of the currently-open note.

If you would like to insert text relative to a particular heading instead of appending to the end of the file, see 'patch'.

Parameters
Try it out
No parameters

Request body

text/markdown
Content you would like to append.

Example Value
Schema
# This is my document

something else here

Responses
Code	Description	Links
204	
Success

No links
400	
Bad Request

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
405	
Your path references a directory instead of a file; this request method is valid only for updating files.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links

PATCH
/active/
Insert content into the currently open note in Obsidian relative to a heading within that document.

Inserts content into the currently-open note relative to a heading within that note.

This is useful if you have a document having multiple headings, and you would like to insert content below one of those headings. For example, if you had the following document:

# An important subject

## Details

# Another important subject

## Details
You could insert content below "Another important subject" by providing Another important subject in your Heading header.

By default, this will find the first heading matching the name you specify. If your heading appears more than once in a document, you can control which heading is used by indicating parent headings with the :: delimiter.

For example, if you would like your content to be inserted after the heading "Details" below "Another important subject" in the above document, you could provide the value Another important subject::Details in your Heading header.

If on the off chance the string "::" occurs in your headers, you can override the delimiter used for separating headers from one another via the Heading-Boundary header.

Parameters
Try it out
Name	Description
Heading *
string
(header)
Name of heading relative to which you would like your content inserted. May be a sequence of nested headers delimited by "::".

Heading
Content-Insertion-Position
string
(header)
Position at which you would like your content inserted; valid options are "end" or "beginning".

Available values : end, beginning

Default value : end


end
Content-Insertion-Ignore-Newline
string
(header)
Insert content before any newlines at end of header block.

Available values : true, false

Default value : false


false
Heading-Boundary
string
(header)
Set the nested header delimiter to a different value. This is useful if "::" exists in one of the headers you are attempting to use.

Default value : ::

::
Request body

text/markdown
Content you would like to insert.

Example Value
Schema
# This is my document

something else here

Responses
Code	Description	Links
200	
Success

No links
400	
Bad Request; see response message for details.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
404	
Does not exist

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
405	
Your path references a directory instead of a file; this request method is valid only for updating files.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links

DELETE
/active/
Deletes the currently-active file in Obsidian.

Parameters
Try it out
No parameters

Responses
Code	Description	Links
204	
Success

No links
404	
File does not exist.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
405	
Your path references a directory instead of a file; this request method is valid only for updating files.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
Vault Files


GET
/vault/{filename}
Return the content of a single file in your vault.

Returns the content of the file at the specified path in your vault should the file exist.

If you specify the header Accept: application/vnd.olrapi.note+json, will return a JSON representation of your note including parsed tag and frontmatter data as well as filesystem metadata. See "responses" below for details.

Parameters
Try it out
Name	Description
filename *
string($path)
(path)
Path to the file to return (relative to your vault root).

filename
Responses
Code	Description	Links
200	
Success

Media type

text/markdown
Controls Accept header.
Example Value
Schema
# This is my document

something else here

No links
404	
File does not exist

No links

PUT
/vault/{filename}
Create a new file in your vault or update the content of an existing one.

Creates a new file in your vault or updates the content of an existing one if the specified file already exists.

Parameters
Try it out
Name	Description
filename *
string($path)
(path)
Path to the file to update (relative to your vault root).

filename
Request body

text/markdown
Content of the file you would like to upload.

Example Value
Schema
# This is my document

something else here

Responses
Code	Description	Links
204	
Success

No links
400	
Incoming file could not be processed. Make sure you have specified a reasonable file name, and make sure you have set a reasonable 'Content-Type' header; if you are uploading a note, 'text/markdown' is likely the right choice.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
405	
Your path references a directory instead of a file; this request method is valid only for updating files.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links

POST
/vault/{filename}
Append content to a new or existing file.

Appends content to the end of an existing note. If the specified file does not yet exist, it will be created as an empty file.

If you would like to insert text relative to a particular heading instead of appending to the end of the file, see 'patch'.

Parameters
Try it out
Name	Description
filename *
string($path)
(path)
Path to the file to alter (relative to your vault root).

filename
Request body

text/markdown
Content you would like to append.

Example Value
Schema
# This is my document

something else here

Responses
Code	Description	Links
204	
Success

No links
400	
Bad Request

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
405	
Your path references a directory instead of a file; this request method is valid only for updating files.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links

PATCH
/vault/{filename}
Insert content into an existing note relative to a heading within that document.

Inserts content into an existing note relative to a heading within your note.

This is useful if you have a document having multiple headings, and you would like to insert content below one of those headings. For example, if you had the following document:

# An important subject

## Details

# Another important subject

## Details
You could insert content below "Another important subject" by providing Another important subject in your Heading header.

By default, this will find the first heading matching the name you specify. If your heading appears more than once in a document, you can control which heading is used by indicating parent headings with the :: delimiter.

For example, if you would like your content to be inserted after the heading "Details" below "Another important subject" in the above document, you could provide the value Another important subject::Details in your Heading header.

If on the off chance the string "::" occurs in your headers, you can override the delimiter used for separating headers from one another via the Heading-Boundary header.

Parameters
Try it out
Name	Description
filename *
string($path)
(path)
Path to the file to alter (relative to your vault root).

filename
Heading *
string
(header)
Name of heading relative to which you would like your content inserted. May be a sequence of nested headers delimited by "::".

Heading
Content-Insertion-Position
string
(header)
Position at which you would like your content inserted; valid options are "end" or "beginning".

Available values : end, beginning

Default value : end


end
Heading-Boundary
string
(header)
Set the nested header delimiter to a different value. This is useful if "::" exists in one of the headers you are attempting to use.

Default value : ::

::
Request body

text/markdown
Content you would like to insert.

Example Value
Schema
# This is my document

something else here

Responses
Code	Description	Links
200	
Success

No links
400	
Bad Request; see response message for details.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
404	
Does not exist

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
405	
Your path references a directory instead of a file; this request method is valid only for updating files.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links

DELETE
/vault/{filename}
Delete a particular file in your vault.

Parameters
Try it out
Name	Description
filename *
string($path)
(path)
Path to the file to delete (relative to your vault root).

filename
Responses
Code	Description	Links
204	
Success

No links
404	
File does not exist.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
405	
Your path references a directory instead of a file; this request method is valid only for updating files.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
Vault Directories


GET
/vault/
List files that exist in the root of your vault.

Lists files in the root directory of your vault.

Note: that this is exactly the same API endpoint as the below "List files that exist in the specified directory." and exists here only due to a quirk of this particular interactive tool.

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Success

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "files": [
    "mydocument.md",
    "somedirectory/"
  ]
}
No links
404	
Directory does not exist

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links

GET
/vault/{pathToDirectory}/
List files that exist in the specified directory.

Parameters
Try it out
Name	Description
pathToDirectory *
string($path)
(path)
Path to list files from (relative to your vault root). Note that empty directories will not be returned.

Note: this particular interactive tool requires that you provide an argument for this field, but the API itself will allow you to list the root folder of your vault. If you would like to try listing content in the root of your vault using this interactive tool, use the above "List files that exist in the root of your vault" form above.

pathToDirectory
Responses
Code	Description	Links
200	
Success

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "files": [
    "mydocument.md",
    "somedirectory/"
  ]
}
No links
404	
Directory does not exist

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
Periodic Notes


GET
/periodic/{period}/
Get current periodic note for the specified period.

Parameters
Try it out
Name	Description
period *
string
(path)
The name of the period for which you would like to grab the current note.

Available values : daily, weekly, monthly, quarterly, yearly

Default value : daily


daily
Responses
Code	Description	Links
200	
Success

Media type

text/markdown
Controls Accept header.
Example Value
Schema
# This is my document

something else here

No links
400	
Bad request; see response for details.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
404	
Your daily note for this period does not exist or periodic notes of the relevant type are not available.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links

PUT
/periodic/{period}/
Update the content of a periodic note.

Parameters
Try it out
Name	Description
period *
string
(path)
The name of the period for which you would like to grab the current note.

Available values : daily, weekly, monthly, quarterly, yearly

Default value : daily


daily
Request body

text/markdown
Content of the file you would like to upload.

Example Value
Schema
# This is my document

something else here

Responses
Code	Description	Links
204	
Success

Media type

text/markdown
Controls Accept header.
Example Value
Schema
# This is my document

something else here

No links
400	
Bad request; see response for details.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
404	
Your daily note for this period does not exist or periodic notes of the relevant type are not available.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links

POST
/periodic/{period}/
Append content to a periodic note.

Appends content to the periodic note for the specified period. This will create the relevant periodic note if necessary.

Parameters
Try it out
Name	Description
period *
string
(path)
The name of the period for which you would like to grab the current note.

Available values : daily, weekly, monthly, quarterly, yearly

Default value : daily


daily
Request body

text/markdown
Content you would like to insert.

Example Value
Schema
# This is my document

something else here

Responses
Code	Description	Links
204	
Success

No links
400	
Bad request; see response for details.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
404	
The period you selected does not exist; see response for details.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links

PATCH
/periodic/{period}/
Insert content into a periodic note relative to a heading within that document.

Inserts content into an existing note relative to a heading within your note.

This is useful if you have a document having multiple headings, and you would like to insert content below one of those headings. For example, if you had the following document:

# An important subject

## Details

# Another important subject

## Details
You could insert content below "Another important subject" by providing Another important subject in your Heading header.

By default, this will find the first heading matching the name you specify. If your heading appears more than once in a document, you can control which heading is used by indicating parent headings with the :: delimiter.

For example, if you would like your content to be inserted after the heading "Details" below "Another important subject" in the above document, you could provide the value Another important subject::Details in your Heading header.

If on the off chance the string "::" occurs in your headers, you can override the delimiter used for separating headers from one another via the Heading-Boundary header.

Parameters
Try it out
Name	Description
period *
string
(path)
The name of the period for which you would like to grab the current note.

Available values : daily, weekly, monthly, quarterly, yearly

Default value : daily


daily
Heading *
string
(header)
Name of heading relative to which you would like your content inserted. May be a sequence of nested headers delimited by "::".

Heading
Content-Insertion-Position
string
(header)
Position at which you would like your content inserted; valid options are "end" or "beginning".

Available values : end, beginning

Default value : end


end
Content-Insertion-Ignore-Newline
string
(header)
Insert content before any newlines at end of header block.

Available values : true, false

Default value : false


false
Heading-Boundary
string
(header)
Set the nested header delimiter to a different value. This is useful if "::" exists in one of the headers you are attempting to use.

Default value : ::

::
Request body

text/markdown
Content you would like to insert.

Example Value
Schema
# This is my document

something else here

Responses
Code	Description	Links
200	
Success

No links
400	
Bad request; see response for details.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
404	
The period you selected does not exist; see response for details.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links

DELETE
/periodic/{period}/
Delete a periodic note.

Deletes the periodic note for the specified period.

Parameters
Try it out
Name	Description
period *
string
(path)
The name of the period for which you would like to grab the current note.

Available values : daily, weekly, monthly, quarterly, yearly

Default value : daily


daily
Responses
Code	Description	Links
204	
Success

No links
400	
Bad request; see response for details.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
404	
The periodic note for this period or the period you selected does not exist; see response for details.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links
Commands


GET
/commands/
Get a list of available commands.

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
A list of available commands.

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "commands": [
    {
      "id": "global-search:open",
      "name": "Search: Search in all files"
    },
    {
      "id": "graph:open",
      "name": "Graph view: Open graph view"
    }
  ]
}
No links

POST
/commands/{commandId}/
Execute a command.

Search


POST
/search/
Search for documents matching a specified search query

Evaluates a provided query against each file in your vault.

This endpoint supports multiple query formats. Your query should be specified in your request's body, and will be interpreted according to the Content-type header you specify from the below options.Additional query formats may be added in the future.

Dataview DQL (application/vnd.olrapi.dataview.dql+txt)
Accepts a TABLE-type Dataview query as a text string. See Dataview's query documentation for information on how to construct a query.

JsonLogic (application/vnd.olrapi.jsonlogic+json)
Accepts a JsonLogic query specified as JSON. See JsonLogic's documentation for information about the base set of operators available, but in addition to those operators the following operators are available:

glob: [PATTERN, VALUE]: Returns true if a string matches a glob pattern. E.g.: {"glob": ["*.foo", "bar.foo"]} is true and {"glob": ["*.bar", "bar.foo"]} is false.
regexp: [PATTERN, VALUE]: Returns true if a string matches a regular expression. E.g.: {"regexp": [".*\.foo", "bar.foo"] is true and {"regexp": [".*\.bar", "bar.foo"]} is false.
Returns only non-falsy results. "Non-falsy" here treats the following values as "falsy":

false
null or undefined
0
[]
{}
Files are represented as an object having the schema described in the Schema named 'NoteJson' at the bottom of this page. Understanding the shape of a JSON object from a schema can be tricky; so you may find it helpful to examine the generated metadata for individual files in your vault to understand exactly what values are returned. To see that, access the GET /vault/{filePath} route setting the header: Accept: application/vnd.olrapi.note+json. See examples below for working examples of queries performing common search operations.

Parameters
Try it out
No parameters

Request body

application/vnd.olrapi.dataview.dql+txt
Examples: 
List data from files having the #game tag.
Example Value
Schema
TABLE
  time-played AS "Time Played",
  length AS "Length",
  rating AS "Rating"
FROM #game
SORT rating DESC

Responses
Code	Description	Links
200	
Success

Media type

application/json
Controls Accept header.
Example Value
Schema
[
  {
    "filename": "string",
    "result": "string"
  }
]
No links
400	
Bad request. Make sure you have specified an acceptable Content-Type for your search query.

Media type

application/json
Example Value
Schema
{
  "message": "A brief description of the error.",
  "errorCode": 40149
}
No links

POST
/search/simple/
Search for documents matching a specified text query

Parameters
Try it out
Name	Description
query *
string
(query)
Your search query

query
contextLength
number
(query)
How much context to return around the matching string

Default value : 100

100
Responses
Code	Description	Links
200	
Success

Media type

application/json
Controls Accept header.
Example Value
Schema
[
  {
    "filename": "string",
    "score": 0,
    "matches": [
      {
        "match": {
          "start": 0,
          "end": 0
        },
        "context": "string"
      }
    ]
  }
]
No links
Open


POST
/open/{filename}
Open the specified document in Obsidian

Status


GET
/
Returns basic details about the server.


