/* EDIT THIS FILE to maintain the journey. No absolute world coordinates needed.
 * Sections run in array order; width grows automatically when more coins are added.
 * building.image: null, or a filename in assets/journey/images/ (e.g. "campus.jpg").
 * coins[].height: pixels above the ground / platform beneath that coin. 28 = walk;
 * 102 = jump. title/text become the speech bubble. Long text is split safely.
 * platforms are optional: at = fraction (0..1) of the area after the building.
 * See JOURNEY.md for a complete example and supported configuration fields.
 */
window.JOURNEY_CONFIG = {
  "defaults": {
    "sectionWidth": 1050,
    "minCoinSpacing": 160,
    "coinHeight": 28,
    "imagePixels": 32,
    "outfit": "casual"
  },
  "sections": [
    {
      "id": "education",
      "outfit": "graduation",
      "name": "Education",
      "color": "#e6ad71",
      "scenery": "campus",
      "building": {
        "name": "University of Winchester",
        "image": "winchester.png",
        "imagePixels": 64
      },
      "coins": [
        {
          "title": "Engineering wasn’t where the journey started.",
          "text": "I trained as a primary teacher with computing. Following a passion of educating people and helping them develop themselves and their lives.",
          "height": 28
        },
        {
          "title": "Something wasn't right",
          "text": "I discovered the passion to teach dwindle replaced by a passion for technology and building things.",
          "height": 102,
          "bonus": true
        }
      ],
      "platforms": [
        {
          "at": 0.06,
          "rise": 48,
          "width": 100,
          "ladder": false
        },
        {
          "at": 0.31,
          "rise": 88,
          "width": 165,
          "ladder": true
        }
      ],
      "details": "I originally trained as a teacher, completing a B.Ed in Primary Education with Computing. Explain complex ideas simply. Adapt to different audiences. Develop people and influence through trust. Explaining ideas, adapting communication and developing people still shape how I lead.",
      "atmosphere": "morning",
      "event": {
        "type": "classroom",
        "trigger": "coin",
        "at": 0.2,
        "duration": 2.4,
        "caption": "HELP SOMEONE UNDERSTAND"
      },
      "characters": [
        {
          "name": "Teacher",
          "at": 0.3,
          "color": "#bf8655",
          "speech": "A different way to learn."
        }
      ]
    },
    {
      "id": "technology",
      "name": "Discovering technology",
      "color": "#77dccc",
      "scenery": "computer",
      "computers": {
        "screen": "terminal",
        "scrollSpeed": 10,
        "lines": [
          "READY.",
          "> LOAD CURIOSITY",
          "EXPLORING...",
          "> LEARN TO CODE",
          "HELLO, WORLD!",
          "> BUILD SOMETHING",
          "OK"
        ]
      },
      "building": {
        "name": "A change of direction",
        "image": null
      },
      "coins": [
        {
          "title": "A desire to be in tech but no way in.",
          "text": "I took a job in people administration after university, here I taught myself to code and automated a large amount of my job.",
          "height": 28
        }
      ],
      "details": "The move from education and customer-facing technology into creating technology opened a new path. The curiosity stayed. The tools changed. Understanding people still comes before understanding the solution.",
      "atmosphere": "terminal",
      "event": {
        "type": "firstbuild",
        "at": 0.46,
        "duration": 1.5,
        "caption": "FROM EXPLAINING TO CREATING",
        "resultLines": [
          "MY FIRST BUILD",
          "> RUN",
          "HELLO, WORLD!",
          "BUILD COMPLETE",
          "> KEEP CREATING"
        ]
      },
      "characters": [
        {
          "name": "Curious customer",
          "at": 0.35,
          "color": "#b894cf",
          "speech": "What could this do?"
        }
      ]
    },
    {
      "id": "early",
      "name": "Early engineering",
      "color": "#efbb67",
      "scenery": "workshop",
      "building": {
        "name": "Learning by building",
        "image": null
      },
      "coins": [
        {
          "title": "Curiosity became a craft.",
          "text": "My early code was basic and unelegant but it taught me to solve complex business problems, utilising technology to make work easier.",
          "height": 28
        }
      ],
      "details": "Building software brought a new way to solve problems. The lessons from teaching travelled with me: make things understandable, share what you learn and help others grow.",
      "atmosphere": "workshop",
      "event": {
        "type": "sharing",
        "at": 0.48,
        "duration": 1.5,
        "caption": "BUILD. LEARN. SHARE."
      },
      "characters": [
        {
          "name": "Engineer",
          "at": 0.7,
          "color": "#759fbd",
          "speech": "Pass it on."
        }
      ]
    },
    {
      "id": "os",
      "name": "Ordnance Survey",
      "color": "#9bd68c",
      "scenery": "map",
      "building": {
        "name": "Ordnance Survey",
        "image": "OS.jpeg"
      },
      "coins": [
        {
          "title": "From coding to engineering.",
          "text": "As a trainee engineer I was taught how to build solutions at enterprise scale and enterprise grade. My first project helped deliver the last package to your home address.",
          "height": 98
        },
        {
          "title": "Engineering at national scale.",
          "text": "I helped establish Common Engineering and the strategy for a platform capability supporting approximately 300 engineers.",
          "height": 28
        },
        {
          "title": "A platform that accelerated delivery.",
          "text": "Reusable accelerators and self-service Azure tooling helped teams deliver compliant cloud infrastructure without a queue for development teams.",
          "height": 102
        }
      ],
      "platforms": [
        {
          "at": 0.06,
          "rise": 45,
          "width": 150,
          "ladder": false
        },
        {
          "at": 0.31,
          "rise": 95,
          "width": 150,
          "ladder": false
        },
        {
          "at": 0.56,
          "rise": 150,
          "width": 145,
          "ladder": true
        }
      ],
      "details": "I helped establish the Common Engineering team and define the strategy for a platform engineering capability supporting approximately 300 engineers. Reusable engineering accelerators. Self-service Azure tooling. Compliant cloud infrastructure without a queue at the platform team. Reusable accelerators and self-service Azure tooling enabled approximately 300 engineers to deliver compliant cloud infrastructure.",
      "atmosphere": "meadow",
      "event": {
        "type": "map",
        "at": 0.45,
        "duration": 1.5,
        "caption": "SEE THE BIGGER PICTURE"
      },
      "characters": [
        {
          "name": "Surveyor",
          "at": 0.74,
          "color": "#af9263",
          "speech": "The paths connect."
        }
      ]
    },
    {
      "id": "platform",
      "name": "Platform engineering",
      "color": "#77dccc",
      "scenery": "pipeline",
      "building": {
        "name": "Platform engineering",
        "image": null
      },
      "effect": "selfservice",
      "coins": [
        {
          "stage": "challenge",
          "title": "Good Governance Speeds Things Up.",
          "text": "Through consistent frameworks, languages, designs and patterns it was easier to reuse code making delivery faster and operations easier.",
          "height": 28
        },
        {
          "stage": "choice",
          "title": "Build a path teams can use themselves.",
          "text": "I chose reusable engineering accelerators and self-service tooling, so teams could provision what they needed without waiting for a central team.",
          "height": 28
        },
        {
          "stage": "outcome",
          "title": "Build capability that lasts.",
          "text": "The platform spanned mutliple locations and engineers. With only seven engineers I created community that became self-sustaining.",
          "height": 28
        }
      ],
      "platforms": [
        {
          "at": 0.12,
          "rise": 92,
          "width": 420,
          "ladder": true
        }
      ],
      "details": "Teams needed compliant cloud infrastructure without a queue at a central team. I chose reusable engineering accelerators and self-service Azure tooling. The platform spanned 13 Azure subscriptions; I led seven engineers and introduced performance, resilience and security indicators. The Cloud Support community became self-sustaining.",
      "atmosphere": "industrial",
      "event": {
        "type": "selfservice",
        "trigger": "coin",
        "coinStage": "choice",
        "at": 0.45,
        "duration": 2.4,
        "caption": "ENABLE TEAMS. CLEAR THE QUEUE."
      },
      "characters": [
        {
          "name": "Engineer",
          "at": 0.4,
          "color": "#d2ab72",
          "speech": "Still waiting..."
        },
        {
          "name": "Engineer",
          "at": 0.5,
          "color": "#8fb99c",
          "speech": "Can we self-serve?"
        }
      ]
    },
    {
      "id": "kyckr",
      "name": "Kyckr",
      "color": "#ecb272",
      "scenery": "cloud",
      "building": {
        "name": "Kyckr",
        "image": "kyckr.png"
      },
      "coins": [
        {
          "stage": "challenge",
          "title": "A cloud estate that was hard to understand.",
          "text": "At Kyckr, I inherited a costly, poorly documented Azure estate: services running in Microsoft’s cloud, with too little clarity about how they fitted together.",
          "height": 28
        },
        {
          "stage": "choice",
          "title": "Understand it before changing it.",
          "text": "I started by understanding the cloud resources and their connections, then simplified what was there. Cost and reliability had to be considered together.",
          "height": 28
        },
        {
          "stage": "outcome",
          "title": "Leave it easier to understand and operate.",
          "text": "Here I learnt to simplify the cloud estate and made its architecture clearer, with cost and reliability considered. I carried that lesson into consulting in regulated markets.",
          "height": 28
        }
      ],
      "details": "At Kyckr, I inherited a costly, poorly documented Azure cloud estate. I started by understanding its resources and connections, then simplified it with cost and reliability in mind. The result was a clearer estate, easier to understand and operate. I carried that lesson into consulting in regulated markets.",
      "atmosphere": "workshop",
      "event": {
        "type": "simplify",
        "trigger": "coin",
        "coinStage": "choice",
        "at": 0.43,
        "duration": 1.5,
        "caption": "UNDERSTAND. SIMPLIFY. OWN."
      },
      "characters": [
        {
          "name": "Engineer",
          "at": 0.74,
          "color": "#86aaaf",
          "speech": "Now I can follow it."
        }
      ]
    },
    {
      "id": "consulting",
      "name": "Consulting · regulated markets",
      "color": "#d2aa79",
      "scenery": "hackathon",
      "building": {
        "name": "Consulting in regulated markets",
        "image": null
      },
      "coins": [
        {
          "stage": "challenge",
          "title": "A different view of engineering.",
          "text": "As a consultant working in regulated markets, I went in with a desire to focus on code. However, Running a hackathon would change what interested me about engineering.",
          "height": 28
        },
        {
          "stage": "choice",
          "title": "Bringing around 90 engineers together.",
          "text": "I ran a hackathon for around 90 engineers. Bringing people together to build became a turning point: I wanted to create the capability and culture behind the code.",
          "height": 28
        },
        {
          "stage": "outcome",
          "title": "From writing code to building capability.",
          "text": "That experience shifted my interest towards building capabilities, culture and technical teams, rather than being the person in the code.",
          "height": 28
        }
      ],
      "details": "As a consultant working in regulated markets, I ran a hackathon for around 90 engineers. The experience shifted my interest from being in the code towards building capabilities and technical teams. It was a turning point in how I wanted to contribute to engineering.",
      "atmosphere": "workshop",
      "event": {
        "type": "hackathon",
        "trigger": "coin",
        "coinStage": "choice",
        "duration": 2.2
      },
      "characters": []
    },
    {
      "id": "specsavers",
      "name": "Specsavers",
      "color": "#8fe0a3",
      "scenery": "city",
      "building": {
        "name": "Specsavers",
        "image": "specsavers_logo.svg.webp"
      },
      "coins": [
        {
          "title": "From early engineer to a bigger landscape.",
          "text": "I had the opportunity to join at the start and shape how the internal capability grew. Separate paths began connecting into a much larger engineering landscape.",
          "height": 28
        },
        {
          "title": "Different organisations. Shared outcomes.",
          "text": "Our model benefits from ideas and input from lots of sources, software engineering is a subjective sport and Specsavers needed to define how it wanted engineering done.",
          "height": 102
        }
      ],
      "platforms": [
        {
          "at": 0.06,
          "rise": 68,
          "width": 180,
          "ladder": true
        },
        {
          "at": 0.31,
          "rise": 135,
          "width": 225,
          "ladder": true
        }
      ],
      "details": "I was one of the early engineers as the internal engineering capability grew. Individual paths started connecting into something much larger. Software · Quality · Data · AI/ML · Platform Retail · Clinical · Supply Chain Software, Quality, Data, AI/ML and Platform; engineering across Retail, Clinical and Supply Chain.",
      "atmosphere": "enterprise",
      "event": {
        "type": "converge",
        "at": 0.44,
        "duration": 1.5,
        "caption": "SEPARATE PATHS. SHARED DIRECTION."
      },
      "characters": [
        {
          "name": "Software",
          "at": 0.4,
          "color": "#7ca9c8"
        },
        {
          "name": "Quality",
          "at": 0.6,
          "color": "#bd9fcb"
        },
        {
          "name": "Data",
          "at": 0.78,
          "color": "#b5ba7f"
        }
      ]
    },
    {
      "id": "repos",
      "name": "Specsavers · scale",
      "color": "#8fe0a3",
      "scenery": "repos",
      "building": {
        "name": "The repository mountain",
        "image": null
      },
      "coins": [
        {
          "title": "5,000+ repositories.",
          "text": "At this scale, defined expectations help engineers find a clear path through the landscape.",
          "height": 28
        }
      ],
      "platforms": [
        {
          "at": 0.06,
          "rise": 48,
          "width": 160,
          "ladder": false
        },
        {
          "at": 0.47,
          "rise": 96,
          "width": 157,
          "ladder": false
        },
        {
          "at": 0.83,
          "rise": 144,
          "width": 125,
          "ladder": true
        }
      ],
      "details": "Somewhere in here is the one you were looking for. At this scale, shared engineering expectations help people find a clear path through the landscape. No repositories were harmed in the making of this mountain. 5,000+ repositories. Shared expectations help people find a clear route through the collection.",
      "atmosphere": "enterprise",
      "event": {
        "type": "repositories",
        "at": 0.45,
        "duration": 1.5,
        "caption": "A LITTLE SHARED STRUCTURE HELPS"
      },
      "characters": [
        {
          "name": "Repository keeper",
          "at": 0.75,
          "color": "#aa9375",
          "speech": "Have you tried the README?"
        }
      ]
    },
    {
      "id": "governance",
      "name": "Engineering governance",
      "color": "#8fe0a3",
      "scenery": "system",
      "building": {
        "name": "Engineering governance",
        "image": null
      },
      "effect": "governance",
      "coins": [
        {
          "title": "Make good engineering decisions easier.",
          "text": "Good governance should make engineering easier. The Engineering Governance Framework helped align approximately 350 engineers around common expectations.",
          "height": 28
        }
      ],
      "platforms": [
        {
          "at": 0.12,
          "rise": 56,
          "width": 500,
          "ladder": false
        }
      ],
      "details": "Good governance shouldn't create process. It should make good engineering decisions easier. As the shared path connects, the scattered engineering pieces find a common rhythm. The Engineering Governance Framework has helped align approximately 350 engineers around common expectations.",
      "atmosphere": "enterprise",
      "event": {
        "type": "governance",
        "at": 0.43,
        "duration": 1.5,
        "caption": "MAKE GOOD DECISIONS EASIER"
      },
      "characters": [
        {
          "name": "Engineer",
          "at": 0.74,
          "color": "#8bbaa0",
          "speech": "A clearer way through."
        }
      ]
    },
    {
      "id": "leadership",
      "outfit": "suit",
      "name": "Head of Software Engineering",
      "color": "#8fe0a3",
      "scenery": "team",
      "building": {
        "name": "Head of Software Engineering",
        "image": null
      },
      "effect": "leadership",
      "coins": [
        {
          "stage": "challenge",
          "title": "My own technical contribution could only go so far.",
          "text": "As the engineering landscape grew, my role changed. Delivering through a wider team needed more than the things I could build myself.",
          "height": 28
        },
        {
          "stage": "choice",
          "title": "Creating the conditions for others to succeed.",
          "text": "My focus became trust, clarity and developing people: creating the conditions for engineers to solve problems and move work forward.",
          "height": 28
        },
        {
          "stage": "outcome",
          "title": "The work scales through other people.",
          "text": "My contribution is helping other engineers do their best work together. Those people, practices and platforms connect into the wider organisation in the next chapter.",
          "height": 28
        }
      ],
      "details": "As the engineering landscape grew, my own technical contribution could only go so far. I focused on trust, clarity and developing people: creating the conditions for engineers to solve problems and deliver together. That connects directly to the wider organisation I lead.",
      "atmosphere": "enterprise",
      "event": {
        "type": "leadership",
        "trigger": "coin",
        "coinStage": "choice",
        "at": 0.38,
        "duration": 2.4,
        "caption": "CREATE THE CONDITIONS"
      },
      "characters": [
        {
          "name": "Engineer",
          "at": 0.52,
          "color": "#7ca9c8"
        },
        {
          "name": "Engineer",
          "at": 0.68,
          "color": "#bd9fcb"
        },
        {
          "name": "Engineer",
          "at": 0.82,
          "color": "#b5ba7f"
        }
      ]
    },
    {
      "id": "today",
      "name": "Engineering today",
      "color": "#8fe0a3",
      "scenery": "network",
      "building": {
        "name": "The organisation I lead",
        "image": null
      },
      "coins": [
        {
          "title": "Trusted experts.",
          "text": "Delivering to time, quality and cost means connecting people, practices, platforms, quality and governance to customers.",
          "height": 28
        },
        {
          "title": "One engineering ecosystem.",
          "text": "Roughly 350 engineers across internal teams and strategic partners, working in Software delivering to the value streams.",
          "height": 102
        }
      ],
      "details": "People, engineering practices, platforms, quality and governance connect delivery to customers. This is a living engineering ecosystem, across internal teams and strategic partners. Roughly 350 engineers in the broader ecosystem. Practices across Software, Quality, Data, AI/ML and Platform. Engineering across Retail, Clinical and Supply Chain.",
      "atmosphere": "enterprise",
      "event": {
        "type": "ecosystem",
        "at": 0.4,
        "duration": 1.5,
        "caption": "PEOPLE TO CUSTOMERS"
      },
      "characters": [
        {
          "name": "Engineer",
          "at": 0.42,
          "color": "#9cb9a7"
        },
        {
          "name": "Customer",
          "at": 0.8,
          "color": "#d2a58d",
          "speech": "That is what matters."
        }
      ]
    },
    {
      "id": "personal",
      "name": "Outside work · optional detour",
      "width": 1500,
      "color": "#eaaaaf",
      "scenery": "park",
      "building": {
        "name": "Outside work",
        "image": null
      },
      "optional": true,
      "coins": [
        {
          "title": "There is more than one kind of keyboard.",
          "text": "I started learning piano a few years ago, after years of trying to teach myself I finally started taking lessions.",
          "height": 28,
          "bonus": true
        },
        {
          "title": "Things that aren't engineering",
          "text": "Musical theatre, history, hiking and American Football help me switch gears.",
          "height": 28,
          "bonus": true
        },
        {
          "title": "Meet Emma.",
          "text": "This is Emma, my wife who has been a huge part of this journey and a massive influence on it.",
          "height": 28,
          "bonus": true
        },
        {
          "title": "Maggie and Matilda.",
          "action": "meetCats",
          "text": "2 cats I never thought I've have but bring so much joy into my life.",
          "height": 102,
          "bonus": true
        }
      ],
      "platforms": [
        {
          "at": 0.06,
          "rise": 45,
          "width": 115,
          "ladder": false
        },
        {
          "at": 0.31,
          "rise": 103,
          "width": 140,
          "ladder": false
        }
      ],
      "details": "Emma is part of my life outside work. Piano, musical theatre, history and hiking help me switch gears. Add Kansas City Chiefs football and two cats who have never once respected a meeting invite. Maggie: calico, head of unscheduled interruptions. Matilda: black cat, quality assurance for every empty box. The cats have declined to provide delivery estimates. Piano, theatre, history, hiking and Chiefs football. Maggie and Matilda remain unconvinced by delivery estimates.",
      "atmosphere": "dusk",
      "event": {
        "type": "personal",
        "at": 0.48,
        "duration": 1.5,
        "caption": "TAKE THE SCENIC ROUTE"
      },
      "characters": []
    },
    {
      "id": "future",
      "name": "The next level",
      "color": "#f7d580",
      "scenery": "horizon",
      "building": {
        "name": "The next level",
        "image": null
      },
      "ending": {
        "playerName": "Phil",
        "cast": [
          { "name": "Teacher", "outfit": "graduation", "color": "#bf8655" },
          { "name": "Engineer", "outfit": "casual", "color": "#7ca9c8" },
          { "name": "Team Builder", "outfit": "hoodie", "color": "#bd9fcb" },
          { "name": "Leader", "outfit": "suit", "color": "#9cb9a7" }
        ]
      },
      "coins": [
        {
          "title": "What carries forward.",
          "text": "Teaching taught me to explain. Cloud engineering taught me to make complexity understandable. Leadership taught me to create the conditions for others.",
          "height": 28
        },
        {
          "title": "The interesting part is what we build next.",
          "text": "Those lessons travel together into the next chapter: clearer thinking, simpler systems and people able to do their best work.",
          "height": 28
        }
      ],
      "platforms": [
      
      ],
      "details": "Teaching, cloud engineering and leadership each left a lesson: explain clearly, make complexity understandable and create the conditions for others. The next chapter brings those lessons together in what we build next.",
      "atmosphere": "horizon",
      "event": {
        "type": "finale",
        "at": 0.3,
        "duration": 1.5,
        "caption": "WHAT WE BUILD NEXT"
      },
      "characters": []
    }
  ]
};
