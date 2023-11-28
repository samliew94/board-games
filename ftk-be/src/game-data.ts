export enum GameEvents {
  PLAYER_JOINED = "PLAYER_JOINED",
}

export enum ServiceManager {
  MAIN = "main",
  LOBBY = "lobby",
}

export const REF_GAME_SETTINGS = {
  journey: {
    short: {
      players: {
        6: {
          offDutySigns: 1,
        },
        8: {
          offDutySigns: 2,
        },
        11: {
          offDutySigns: 3,
        },
      },
      directions: {
        northYellow: {
          cultUprising: 5,
        },
        eastBlue: {
          drunk: 3,
          disarmed: 2,
        },
        westRed: {
          drunk: 5,
          mermaid: 2,
          telescope: 2,
        },
      },
    },
    long: {
      players: {
        8: {
          offDutySigns: 2,
        },
        11: {
          offDutySigns: 3,
        },
      },
      directions: {
        northYellow: {
          cultUprising: 6,
        },
        eastBlue: {
          drunk: 4,
          disarmed: 2,
        },
        westRed: {
          drunk: 5,
          mermaid: 2,
          telescope: 2,
          armed: 2,
        },
      },
    },
  },
  teams: {
    players: {
      5: {
        sailors: [3, 2],
        pirates: [1, 2],
      },
      6: {
        sailors: 3,
        pirates: 2,
      },
      7: {
        sailors: 4,
        pirates: 2,
      },
      8: {
        sailors: 4,
        pirates: 3,
      },
      9: {
        sailors: 5,
        pirates: 3,
      },
      10: {
        sailors: 5,
        pirates: 4,
      },
      11: {
        sailors: 5,
        pirates: 4,
        cultist: 1,
      },
    },
  },
};

export const REF_CHARACTER ={
  
  characters:[
    {name:'Kleptomaniac'},
    {name:'Troublemaker'},
    {name:'Gunsmith'},
    {name:'Peacemaker'},
    {name:'Gunslinger'},
    {name:'Minstrel'},
    {name:'Bosun'},
    {name:'Herbalist'},
    {name:'Look-Out'},
    {name:'Master Strategist'},
    {name:'Smuggler'},
    {name:'Agitator'},
    {name:'Consultant'},
    {name:'Chief Cook'},
    {name:'Rabble-rouser'},
    {name:'Archivist'},
    {name:'Mentor'},
    {name:'Spiritualist'},
    {name:'Debt Collector'},
    {name:'Equalizer'},
    {name:'Instigator'},
  ]

}