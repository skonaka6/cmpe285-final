# AI usage reflection

## Main uses

Cursor's default agent Claude Sonnet 4.6 was used to quickly deploy mockups and wireframes of the mobile app and later for individual features. It was helpful in setting up unfamiliar api calls in newer frameworks of the tech stack like SQLite, and saved time in reading documentation, installation, and setup pages - it deployed a minimum working prototype ready for modification on demand. Claude was also consulted in the beginning for what frameworks to employ for the tech stack, which is how SQLite and Vite were included in the project. Workflow for individual features followed a cycle of setting up stubs for buttons and API calls, comparing with project specifications, and finally altering thematic details and occassionally data format details for future convenience.

## Pros

In this project example AI has been hellplful in an informed generalist role. Originally I would have committded to the project with MySQL for the database compoennt, which would have included overhead for launching, managing, and (during backend testing) cleaning/resetting the server independently of the rest of backend. SQLite was a tech stack component I was not aware of the option for, and its inclusion saved me what may have been a good half or full hour of development. Claude also saved time in handling tedious code like generic frontend elements in initialization and several mostly similar API calls.

## Cons

While Claude being able to include unmentioned knowledge like SQLite has been immensely helpful, it sometimes goes a bit too far in trying to solve problems "its own way." For example, it has a tendency to include a column for date_created for votes, users, and sessions. This column is not necessary for any of these tables, and could be substituted for already existing item IDs. It also eviddently can misunderstand multimedia implementations, as in prototyping it associated completely unrelated images to textual labels (this was before the pet -> clothing theme change).

## Design overrulings and pushbacks

There are a few instances where Claude's suggested implementation approaches were vetoed. The first and most significant came with the theme change to clothing styles. A way to collect clothing item labels, descriptions, and images (preferably via image url, so as to avoid downloading 100 images) had to be considered, and eventually I decided to use an online dataset from Kaggle, which I had previous experience in pulling from. This involved slightly rewriting the seeding script to use csv files instead of trying to randomly generate entries. <br>
Another conflict I had with Claude was the implementation of the revoting button. It tried to implement it in such as way that the user can only go back and change their vote for a singular item, but I had to change it to work as a "go back and you can resume voting from this point" type of back-button, as I believed that would be more intuitive for the user, enabling serial revoting.