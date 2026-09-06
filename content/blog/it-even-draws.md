---
title: "It even draws"
description: "Two iterations with GPT-6 Astra got me a working, 3D-printed drawing machine. I'm still surprised by how little effort that took."
publishedAt: "2026-09-07T04:30:00.000Z"
slug: "it-even-draws"
draft: false
tags: []
image: "/media/it-even-draws/drawing-machine-in-use.jpeg"
---

I asked GPT-6 Astra to design a cycloid drawing machine I could 3D print: turn a crank and gears move a pen through fun geometric patterns. It took two iterations. The first was a tad wonky: it looked convincing on the surface, but the mechanism couldn't really work. For the second, I asked ChatGPT to first validate the design through simulation, with a hand turning the crank and enough room for it throughout the motion (it also created a reusable skill for this; the design checks used MuJoCo for motion simulation and Coal for collision and clearance checks). I printed it, assembled it, and it actually worked. It even provided interchangeable gears so I could draw different geometric patterns. That's the thing in the photos, drawing on paper.

![The 3D-printed drawing machine, with green and white gears and arms holding a pen over a geometric drawing.](/media/it-even-draws/drawing-machine.jpeg)

I'm still amazed by how little effort this took. That amazement has mostly worn off for me when it comes to software development; directing models to build things is just how I work now. But not that long ago I was modelling parts in [Fusion 360](https://www.autodesk.com/products/fusion-360/personal), thinking it would be a while before I could spend most of my time orchestrating models for physical things too. And now there's a little machine on my table that ChatGPT designed, turning a crank into drawings. Kind of crazy.

![Hands turning the green crank while the linked arms draw a geometric pattern with a green pen.](/media/it-even-draws/drawing-machine-in-use.jpeg)
