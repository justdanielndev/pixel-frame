# At a glance - General info

### Example insight set

🌤️ Tomorrow partly cloudy, 18°C with possible PM showers

📺 Stranger Things S5 - only 1 episode left!

⏰ Physics lab report due in 2 days (Sunday)

✨ Bedtime averaging 23:54... finals in 12 days Dan!

### Categories

There are 4 different categories that At a glance can show recommendations/insights of:

🌤️ Weather insight

📚/📺 Study/reading/tv insight, can even be a quote (from what the person is watching or reading)

⏰ Schedule/productivity insight

✨ Goals/motivation insight - If moods or habits are bad or unexpected

In most cases, At a glance (powered by Claude) will generate 3 insights, unless in really specific cases in which a 4th one is really needed.

### Data used for creation

At a glance uses various sources to create its insights:

**1. Information about the user** (hardcoded in prompt)

Name, gender, pronouns, description, hobbies, interests...

**2. Objectives** (hardcoded in prompt)

Things the user wants to achieve in the short or long term (sleep/study goals, etc).

**3. Date time, and weather**

Current date and time in the user's timezone, as well as outside weather in their city.

**4. Indoor conditions**

Thanks to the humidity and light sensors, information about how it feels inside of the room compared to outside (can also be used to suggest lowering blinds or turning lights on).

**5. Days to exams**

Pretty obvious... Basically the number of days left until the next "exams group" (finals, for example) start.

**6. Bedtime patterns**

When did the user go to sleep in the last 7 days.

**7. Study performance**

Last 7 days' study sessions' dates and times, what the user was studying and how productive they were and why (according to the user).

**8. Focus sessions**

Last 7 days' focus sessions' dates and times, what the user was focusing on and how productive they were and why (according to the user).

**9. Tasks and calendar**

Incoming and finished events and tasks with their timestamps for completed or due.

**10. Screen time**

I don't think this needs explanation... :D

**11. Reading and books**

Last 7 days' reading sessions (timestamps and info about the book, pages read, etc) + books read, in progress and pending with their respective ratings and completion percentage (for in progress books).

**12. TV**

Last 7 days' TV (movies and series) sessions (timestamps and info about the show/movie, time/eps watched, etc) + movies/shows watched, in progress and pending with their respective ratings and completion info (chapters/time left for in progress shows/movies).

**13. Next appointment**

The user's next appointment and its timestamp, location, etc.

**14. Mood**

Information about the user's mood, what they're worried about...

**15. Study streak**

I don't think this needs explanation... But number of days that the user has been studying in a row. 2-3 of the last study streaks.

**16. Home status**

If the user has smart elements in their home, information about them.

**17. History**

Last generated insights of the day with their timestamps, to try to not excessively change unless needed.
