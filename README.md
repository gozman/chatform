chatform.ai
=======================

**Live Demo**: http://chatform.ai

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)


Table of Contents
-----------------

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

Features
--------

- Create surveys or forms and gather responses using: Facebook Messenger, WeChat, Twilio SMS, LINE Messenger, Telegram, Viber, Twitter DM, Web Chat, e-mail, and in-app chat on iOS and Android.
- Download responses to your forms and surveys as a CSV file: easily import these responses into Microsoft Excel, Google Sheets, Numbers and loads of other software.
- Automatically identify the respondent (First & Last Name) when they respond using a supported messaging app.
- Supervise all responses to your survey using Slack, HipChat, Front or your favourite business system. Jump into any conversation live!
- Open source (MIT license) so you can modify and improve chatform and make it even more awesome.

Prerequisites
-------------

- [Smooch.io](https://smooch.io)
- [MongoDB](https://www.mongodb.org/downloads)
- [Node.js 6.0+](http://nodejs.org)
- [Redis](http://redis.org)

Getting Started
---------------

The easiest way to get started is to simply deploy this code to Heroku with the following button:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Once you fill out the button, you only have one enviroment variable to specify: CHATFORM_BASE_URL. This variable should be set to the web address for your new app. For example, if you are calling your app "foo-form", then CHATFORM_BASE_URL should be set to https://foo-form.herokuapp.com

FAQ
---

### Why did you build this?

I'm the co-founder of Smooch.io and spend a lot of my time thinking about how messaging is going to re-shape the way we interact with technology. A few months ago, we transformed our product's on-boarding: from a set of static web forms to a completely [conversational flow](http://blog.smooch.io/our-newest-hire-is-a-bot/). This simple change drove 12% more people to complete the new on-boarding. As a result, some of us at Smooch began to wonder how engaging a traditional web form could become if it were made conversational and delivered over the user's favourite messaging app.

Fast forward to early 2017, back from Christmas vacation and with an urge to code. Lucie and I decided to join forces and build chatform to demonstrate how easily one could build a conversational form builder using the Smooch APIs. We built this project really quickly, there are probably lots of bugs, but we just had to get it out to the world and really hope you enjoy it.

### Why is this free?

We want to inspire more people to think about how messaging interactions can change the way their users interact with their software. Chatform is one example of this, but what if Typeform, Google Forms or Wufoo went conversational? Will we begin to see more and more people conversing with their forms and surveys, instead of mechanically filling them out?

### What messaging channels does this support?

Chatform uses [smooch.io](https://smooch.io) to send and receive messages through one API to a wide variety of [supported messaging channels](https://app.smooch.io/integrations/categories/customer-channels). You can publish surveys built with chatform across any of the messaging channels that Smooch supports.

### Can you use carousels? Lists? Images?

Yes you can! But...

We only had 48 hours to complete this project and as such, we couldn't build in support for all of the [rich messaging features](https://smooch.io/rich-messaging/) that Smooch.io supports. If there's something you'd like to see, why not submit a pull request? The [Smooch API Reference](http://docs.smooch.io/rest) contains everything you need to add support for more messaging features to Chatform. Best of all, if you implement any of those features, they'll become available across all channels that Smooch supports.

Contributing
------------

If something is unclear, confusing, or needs to be refactored, please let me know.
Pull requests are always welcome, but due to the opinionated nature of this
project, I cannot accept every pull request. Please open an issue before
submitting a pull request.

License
-------

The MIT License (MIT)

Chatform logic and implementation:
Copyright (c) 2017 Mike Gozzo

Chatform design and UI:
Copyright (c) 2017 Lucie Le Touze

Chatform logo:
Copyright (c) 2017 Kevin Gauthier

Boilerplate express app (Hackathon Starter):
Copyright (c) 2014-2016 Sahat Yalkabov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
