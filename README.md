# Pixel Frame

_An all-in-one everyday E-Ink life dashboard integrating calendar, notes, tasks, e-reader functionality, and AI assistant._

![render](https://github.com/justdanielndev/pixel-frame/blob/main/render-final.png?raw=true)

## Overview

Pixel Frame is a smart home dashboard that combines my love for e-ink displays with modern web technologies and AI. It was inspired by retro pixel art aesthetics, and tries to help you with productivity, mental health, and more!

## Why build this?

Since I was quite young, I've always loved how E-Readers looked. I found them very cool and thought that they could be improved to do much more than just, well, show books. This is why I did this project, to actually be able to fulfill my dream of having a dashboard that didn't strain my eyes, distract me or generate "dumb dopamine", update only when needed and... still be an e-reader! I also wanted to have my Pixel's At a glance in more places, so I coded it from scratch with the help of AI, and now it's a main part of the project! Overall, I think it'll help me ditch my clock, tablet for reading, and much more!

### Features

- **AI-Powered "At a Glance"** - Contextual daily insights using Claude API
- **Integrated E-Reader** - Fast 0.5s page turns with partial refresh
- **Smart Home Dashboard** - Environmental monitoring and control
- **Calendar & Task Management** - Unified productivity interface
- **Voice Assistant** - Natural language interaction
- **Web-Based UI** - Modern HTML/CSS/JS interface rendered to e-ink

## Architecture

### Hardware

- **Display**: Waveshare 7.5" E-Ink HAT (800×480, 0.5s partial refresh)
- **Computer**: Raspberry Pi 4 2GB (web rendering + AI processing)
- **Sensors**: DHT11 (temperature/humidity), photoresistor (brightness), rotary encoder (navigation)
- **Audio**: USB microphone for voice commands
- **Expansion**: GPIO expander HAT for sensor integration
- **Power**: USB-C 5V 3A supply

### Software

```
Web Interface (HTML/CSS/JavaScript) ->
Puppeteer Controller (Screenshot capture + rotary encoder input conversion) ->
Python Display Manager (E-ink control + sensor integration) ->
Hardware Layer (E-ink display + sensors + GPIO)
```

## UI

### Design style

- High contrast, minimal colors, strategic whitespace
- Updates when data changes (or every 15 minutes, whichever happens first)

### Screen Layouts

- **Home Dashboard** - Weather, At a glance, quick actions
- **E-Reader** - Self explanatory :D
- **Calendar View** - Monthly calendar with daily events
- **Notes Interface** - Note reader (can be created with phone using companion app)
- **AI Assistant** - Chatbot with same context as At a glance

### At a Glance

At a glance generates personalized daily insights based on:

- Calendar events and upcoming deadlines
- Task completion status and productivity patterns
- Reading and TV progress and recommendations
- Data from sensors
- Weather forecasts
- Personal preferences (hardcoded) and daily routines

More info [here](https://github.com/justdanielndev/pixel-frame/blob/main/at-a-glance/INFO.md)

### E-Ink-related

- Partial refresh (0.5s) for quick updates
- Full refresh every 5 partial refreshes (needed so that the screen doesn't brick)
- 15-minute update cycle as E-Ink have a limited refresh lifetime

### E-Reader Integration

- Multiple format support (EPUB, PDF)
- Reading progress tracking

## Bill of Materials

|Item Name                 |Description                                          |Purpose in Project                                                       |Source               |Price (EUR)|Status                               |
|--------------------------|-----------------------------------------------------|-------------------------------------------------------------------------|---------------------|-----------|-------------------------------------|
|Waveshare 7.5" E-Paper HAT|Black & white e-ink display with 0.5s partial refresh|Main interface display for smart home dashboard                          |AliExpress           |63.7       |Highway Funded                       |
|Raspberry Pi 4 2GB        |Single board computer with ARM processor             |Main processing unit for UI rendering, sensor handling and AI integration|AliExpress           |65.50      |Highway Funded                       |
|MCP23017 GPIO Expander    |16-channel I2C GPIO expander breakout                |Additional GPIO pins for sensor integration                              |AliExpress           |2.38       |Highway Funded                       |
|USB Microphone            |USB Microphone                                       |Voice commands for AI assistant                                          |AliExpress           |1.29       |Highway Funded                       |
|KY-040 Rotary Encoder     |Rotary encoder with integrated push button           |Navigation control and menu interaction                                  |Already Owned        |0.00       |Self Sourced                         |
|DHT11 Sensor              |Temperature and humidity sensor module               |Indoor environmental monitoring                                          |Already Owned        |0.00       |Self Sourced                         |
|Photoresistor             |Photoresistor for brightness detection               |Automatic screen brightness adjustment                                   |Already Owned        |0.00       |Self Sourced                         |
|Jumper Wires              |Male/Female jumper wire set                          |Component connections and prototyping                                    |Already Owned        |0.00       |Self Sourced                         |
|MicroSD Card 64GB         |High-endurance microSD card                          |Operating system and web application storage                             |Self Purchase        |12.00      |Self Sourced                         |
|USB-C Power Supply        |5V 3A USB-C power adapter                            |Main power supply for Raspberry Pi 4                                     |Self Purchase        |15.00      |Self Sourced                         |
|Picture Frame             |Wooden picture frame for housing                     |Professional enclosure for finished device                               |Contact Manufacturing|5.00       |Self Sourced                         |
|3D Printed Parts          |Custom back plate and stand components               |Mounting hardware and device stand                                       |Contact Manufacturing|0.00       |Self Sourced                         |
|TOTALS:                   |                                                     |                                                                         |                     |132.87     |Highway Total                        |
|TOTALS:                   |                                                     |                                                                         |                     |32.00      |Self-Sourced Total                   |
|TOTALS:                   |                                                     |                                                                         |                     |164.87     |Project Total (counting Self-Sourced)|

Also available [here](https://github.com/justdanielndev/pixel-frame/blob/main/bom.csv)

## Future Enhancements

- Home automation integration
- Proper mobile app for notes editing
- Advanced reading features (highlighting, annotations)
