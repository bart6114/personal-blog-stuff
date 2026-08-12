# what's that mountain called again?

A few times a year I'm standing somewhere with mountains in front of me and wonder what they're called.

I use [PeakVisor](https://peakvisor.com/) for this. Point the camera at some mountains and it shows their names. The free version limits you to one location per day though, and apparently I don't want this badly enough to pay for another subscription. (People who make good apps are allowed to charge money. I'm just a slightly annoying customer.)

So I asked my coding agent to give it a go.

The request was basically: build a web app that uses the phone's camera, location and compass, pulls public elevation and peak data, and overlays the right names on the right mountains. No backend, accounts or app store.

It worked after the first iteration.

Not perfectly, obviously. Phone compasses are noisy and lining up the digital horizon still benefits from a manual nudge. But the terrain, hidden peaks and moving labels were all there.

Kinda a wtf moment.

The result is [NameThatPeak](https://namethatpeak.com/). It's best opened on a phone. You can use it directly in the browser, or install it as a PWA if you want it on your home screen.

It does need internet access to fetch elevation and peak data. PeakVisor definitely handles the offline and polished-app side better. Mine is a static React site built to scratch my own tiny itch.
