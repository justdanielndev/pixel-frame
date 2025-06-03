# What does the Pixel Frame do and how does it work?
The Pixel Frame allows you to have all of your life (calendar, notes, weather, AI assistant and even e-reader!) on a single, good looking device. When you first self-host it, you'll see a UI like this: ![UI](https://github.com/justdanielndev/pixel-frame/blob/main/dash-new.png?raw=true)

You will then need to set up your own AI integration and data sources for At a glance and Now happening (the code is designed to work mainly with Anthropic's Claude, but you shouldn't have any issues if you want to customize it to work with local models), and that's it! If you want more information on what At a glance needs as inputs for its data, check out [this page](https://github.com/justdanielndev/pixel-frame/blob/main/at-a-glance/INFO.md).

Your Pixel Frame should be all set by now, so let me guide you a bit around its UI and features. 

### Page Controls

Each page has its own interactions that you can do but the basic controls are single click to select, rotate to cycle between options and hold to go back.

On the **Dashboard**, you can do the following:

1. Click the knob once to show the current time for some seconds (until the minute changes to the next one) instead of the weather
2. Rotate left or right the knob to open the "App Launcher". Inside of it you will be able to select any of the available apps to launch
3. Hold the knob to ask a question to the AI assistant. Hold for 1s to open the assistant UI, keep holding while you ask the question (start speaking once UI appears) and release to send the query and wait for the response. Hold the knob while in Assistant UI to go back.

On the **Books page**, you can do the following:

1. Click on a book to start reading it (or continue where you left off)
2. Press and hold to go back to dashboard
3. With a book opened, click once to open the menu (toggle dark mode on/off, exit book or return to reading)

On the **Notes page**, you can do the following:

1. Click on a note to show its context menu (read, edit in phone with a QR code or delete)
2. Press and hold to go back (to the Notes page if a note is opened or to the dashboard if on the main Notes page)

On the **Calendar page**, you can scroll through the days to see your events.

Finally, on the **Weather page**, you can see the weather for the next days rotating the knob.

### Customization

To add ebooks to your library, place them inside of the `books/` directory. Currently the Pixel Frame only supports EPUB files.
