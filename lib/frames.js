'use strict';
/* Letter frames (the "paper" a fan writes on) and starter templates.
   Each frame id has a matching `.fr-<id>` class in src/input.css. Add one there, then list it here. */

const FRAMES = [
    ['classic', 'Classic'], ['midnight', 'Midnight'], ['amethyst', 'Amethyst'], ['galaxy', 'Galaxy'],
    ['sky', 'Sky heart'], ['rose', 'Rose'], ['lavender', 'Lavender'], ['sunset', 'Sunset'],
    ['mint', 'Mint'], ['notebook', 'Notebook'], ['kraft', 'Kraft paper'], ['ocean', 'Ocean'],
    ['gold', 'Gold on black'], ['borahae', 'Borahae hearts']
].map(([id, name]) => ({ id, name }));
const FRAME_IDS = FRAMES.map((f) => f.id);

/* Starter texts. Square brackets mark the parts a fan replaces. No greeting: the card already says "Dear ...". */
const TEMPLATES = [
    ['Thank you for the music', 'Thank you for the music that has walked with me through [school / work / a hard season]. Your songs [song name] and [song name] made me feel less alone. I hope you know how much it means to people far away.'],
    ['You inspire me', 'Watching you work so hard has changed how I see my own goals. When I feel like giving up, I remember [a moment or a lyric] and try one more time. Thank you for showing me what dedication looks like.'],
    ['Birthday wishes', 'Happy birthday! I hope today is full of good food, warm hugs and people who love you. Thank you for another year of [something you loved this year]. I am celebrating from [city or country].'],
    ['Welcome back', 'Welcome back! I waited for this comeback with so much hope, and [song name] made me smile from the very first second. Please rest well and take care of yourselves.'],
    ['A concert memory', 'I still remember the night I saw you [live / on a screen]. The sea of purple lights, singing together with strangers who felt like friends. I will keep that feeling forever. Thank you for the memory.'],
    ['Why I became ARMY', 'I became ARMY in [year] when I first heard [song name]. Since then I have found music, friends and courage I never expected. This fandom feels like a second home.'],
    ['To fellow ARMY', 'To everyone reading this: you are not alone. Whatever kind of day you are having, there are people all over the world who love the same songs as you. Drink some water, rest a little, and keep going. Borahae!'],
    ['Take care of yourselves', 'Please remember to eat well, sleep well and be kind to yourselves. We are proud of you for every step, big or small. We will be here, waiting and cheering.'],
    ['My favourite song', 'My favourite song is [song name] because [reason]. Every time it plays I remember [a memory]. Thank you for writing songs that stay with us long after they end.'],
    ['Your words helped me', 'Your words about [topic] stayed with me. I try to remember them when I feel unsure. Thank you for being honest and for showing that it is okay to grow slowly.'],
    ['Congratulations', 'Congratulations on [an anniversary / an award / a milestone]! It has been a joy to watch you grow. We are so proud of every step and excited for what comes next.'],
    ['Hello from far away', 'Hello from [country]! Even though we are far apart, your music reaches me every day. I hope we can meet someday. Until then I will keep listening and sending lots of love.']
].map(([name, text]) => ({ name, text }));

module.exports = { FRAMES, FRAME_IDS, TEMPLATES };
