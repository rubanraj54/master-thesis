export default `

type Talk {
  _id: String
  name: String
  conferenceName: String
  video: String
  votes: Int
  description: String
  speakerName: String
  date: String
}

type Robot {
  _id: String
  type: String
  name: String
  mac_address: String
}

type Query {
  allTalks(
    name: String,
    conferenceName: String,
    video: String,
    description: String,
    speakerName: String,
  ): [Talk!]!,

  allRobots(
    name: String,
    mac_address: String,
  ): [Robot!]!,

  getTalk(
    id: String!
  ): Talk!

  getRobot(
    id: String!
  ): Robot!
}

type Mutation {
  createTalk(
    name: String!,
    conferenceName: String!,
    video: String!,
    description: String!,
    speakerName: String!,
    date: String!
  ): Talk!

  createRobot(
    type: String!,
    name : String!,
    mac_address : String!,
  ): Robot!


  upvoteTalk(
    id: String!
  ): Talk!
}

`
