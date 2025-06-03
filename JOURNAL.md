---
title: "Pixel Frame"
author: "Daniel"
description: "An all-in-one everyday E-Ink life dashboard integrating calendar, notes, tasks, e-reader functionality, and more."
created_at: "2025-05-26"
---

# 27th of May - Project Beginning

Today I started off the project by designing its general structure, basic features and a bit on how the style should look like. I've always wanted to design a project like this, a very unique use for E-Ink technologies that I've seen little to no people do at this scale.

Inspiring myself from the retro pixel art style of software like PictoChat (from the DS) and adhering to the limitation that E-Ink displays have (limited refresh rate and colors), I settled for a UI style that is uncluttered, uses a very small variety of colors and tries to only update itself when needed (if you know something about E-Ink displays, they blink different colors when doing a full refresh to actually "paint" the frame, meaning that this is a distracting element)... Something like this! ![ui](https://github.com/justdanielndev/pixel-frame/blob/main/UI.jpg)

And you may be wondering... what is that "at a glance" or "smart suggestions"? Well, these are the first features I'm integrating with the project! I have a Pixel phone myself and (unlike a lot of people, for some reason) I love its At a glance feature. It shows a dinamically updated overview of the things you might need to take into account, like your near schedule or your tasks near deadline. The issue? It's too simple and non-personalized. So, I redesigned it! Using Claude 3.7 Sonnet in my case (but it should work with self-hosted alternatives), I created my "better" version. 

It uses information like what you're reading or watching on tv, your tasks, calendar, events, your hobbies, the weather... and, every certain amount of time (15 minutes at the moment, but I made it so that it only updates if something needs to be changed to not be distracting), crafts a custom, 3-4 lines personalized "overview" of anything you may need to know! It even sometimes tries to cheer you up!

And then there's smart suggestions. While it may seem similar, instead of providing insights, it lets you know _actions_ you can do (checking notifications, reading the news...). This one uses realtime access to notifications frm your phone, news apis, live events... together with the ones At a glance already has. I'm thinking of combining them or redesigning this one, though.

So that sums up what I did today! UI and UX design, and the structure and functionality of those 2 features!

**Total time spent: 4h**

# 28th of May - Hardware, yay!

Today I decided to investigate on the available E-Ink display options. After researching for a while I found the [Inky Impression](https://shop.pimoroni.com/products/inky-impression-7-3?variant=55186435244411) screen, which seemed like quite a good option! It had a starting price decently close to a black and white screen _while being in color_, but... the refresh rate was too bad. It didn't support partial refreshing, which meant that for every single update you tried to do to the screen, it would flash in 7 colors a lot of times before, 12 seconds later, actually showing the image you wanted. So, I had to sadly say no to it and go towards a black and white screen. Fortunately, I found [this](https://es.aliexpress.com/item/1005008130176175.html) Waveshare E-Ink display which allowed partial refreshes with speeds up to 0.5s/refresh. Amazing! But, I also discovered after checking its specs that it has a limited amount of refreshes... 1 million aproximately. This may seem ok at first, until you realise that my original plan was to refresh the screen _every single minute_. Yeah, that can't be, it would last less than a year. So, bye bye realtime clock! I'll try to find ways to replace you with something still useful tomorrow. But at least, now we have a screen that, when updated every 15 minutes, will last 20+ years! Amazing!

Finally for today I also decided to think about how exactly I would render the actual UI on the display. Native Python? Nah, too simple of a challenge (joking, it's UI nightmare). Instead, I decided that I would use a webserver + Chromium Headless to render the UI and every time it is updated take a picture. Depending on what has been updated, I would send that picture to the screen and do either a partial refresh or a full refresh (full every 5 partial refreshes). For this, I would need a Pi 4-5, so that's what I will research tomorrow as well.


**Total time spent: 3h**


# 29th of May - Pies and ingredients


New day, new challenge! In this case, finding the best "ingredients" (hardware) for the project. Going around my house I managed to find a rotary encoder, humidity sensors, photoresistors and some LEDs, so we can remove those from the final cost! We still need 3 things though: the microcontroller, the GPIO expander and the microphone.

For the microcontroller (as the title of this day suggests) I went for the Pi 4 from the 2 that I mentioned yesteday. The reason? Cheaper and I won't need most of the extra processing power for this project, as the Pi 4 should run Chromium Headless quite fine. Why not a zero? Python results in an absolutely horrible UI, plus the Pi Zero takes too much time to even open one page of the ebook files.

Now, GPIO expander time... quite simple choice, to be honest. I went for [this one](https://es.aliexpress.com/item/1005008892894010.html), which is pretty much the only one available lol. And for the microphone, went for [this one](https://es.aliexpress.com/item/1005006143016443.html) that is quite cheap and should work just fine with voice recognition.

Finally for today, I found a way to fix the issue with the time eating display refreshes! Essentially, I only show the time if the user clicks the knob, and does so until the time changes to the next minute, in which it goes back to usual weather, date, etc display.

**Total time spent: 1h**

# 30th of May - UI!

So, today is time for UI design! I started with these designs for e-book reader:

![one](https://github.com/justdanielndev/pixel-frame/blob/main/reader-one.png?raw=true)

![two](https://github.com/justdanielndev/pixel-frame/blob/main/reader-two.png?raw=true)

![three](https://github.com/justdanielndev/pixel-frame/blob/main/reader-three.png?raw=true)

Just a tiny issue... this isn't my screen size :/ sooo I had to redesign some of them them after realizing that... 

Essentially, for the homepage I removed the recommendations part (will integrate it later with the actual books that are shown): ![books-new](https://github.com/justdanielndev/pixel-frame/blob/main/reader-new.png?raw=true)

And instead of the modal that was previously shown when opening a book, it now directly opens the book!

I think it overall looks quite good!

Next, homepage redesign! Not only did I remove the time to account for that feature change, I also replaced smart suggestions with Now Happening, which gives realtime information about deliveries, meetings, etc. ![new-home](https://github.com/justdanielndev/pixel-frame/blob/main/dash-new.png?raw=true)

I also designed the UI for notes (ignore the repeated items :D)! ![notes](https://github.com/justdanielndev/pixel-frame/blob/main/notes.png?raw=true)

And finally, calendar UI! This was a quite hard day... ![calendar](https://github.com/justdanielndev/pixel-frame/blob/main/calendar.png?raw=true)

**Total time spent: 4h**

# 31st of May - AI Assistant and Early Documentation

Today I decided that I wanted to code and add my own Alexa-like AI assistant to the Pixel Frame. After some tinkering with different HTML and CSS styles, it ended up looking nice! ![AI](https://github.com/justdanielndev/pixel-frame/blob/main/AI.png?raw=true)

The response might seem short, but that's because it wouldn't fit on the screen, so the Pixel Frame automatically crops it and makes it become multiple pages :D

I added some prompting and make it be able to use the same context as the At a glance information!

After that I wrote [some information on what At a glance does and which data it uses](https://github.com/justdanielndev/pixel-frame/blob/main/at-a-glance/INFO.md), and [a software guide on what Pixel Frame does and how it works](https://github.com/justdanielndev/pixel-frame/blob/main/guides/SFW-INTRO.md)! I think these are very useful both for anyone judging the project (Highway, I'm looking at you :D) and also for anyone who wants to make the project for themselves in the future! They're a bit rough at the moment, but I'll keep improving them!

**Total time spent: 2h**

# 3rd of June - Uploading to GitHub, linking and rough BOM

Both yesterday and today I began uploading all of the docs and pictures to GitHub (yesterday only some screenshots), so that way I can migrate this Journal from Obsidian (current location) to GitHub to actually add it to the projects gallery.

In addition, I've been working on a rough BOM for the project! Maybe in the future some things change, but [this is how it's looking right now](https://github.com/justdanielndev/pixel-frame/blob/main/bom.csv). And with that today's work should be done (I had exams and couldn't do too much sadly).

**Total time spent: 1h**
