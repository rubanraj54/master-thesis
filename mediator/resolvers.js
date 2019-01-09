export default {
  Query: {
    allTalks: async (parent, args, { Talk, Robot }) => {
      const talks = await Talk.find(args)
      return talks.map(x => {
        x._id = x._id.toString()
        return x
      })
    },
    allRobots: async (parent, args, { Talk, Robot }) => {
      const robots = await Robot.find(args)
      return robots.map(x => {
        x._id = x._id.toString()
        return x
      })
    },
    getTalk: async (parent, args, { Talk, Robot }) => {
      const talk = await Talk.findById(args.id)
      return talk
    },
    getRobot: async (parent, args, { Talk, Robot }) => {
      const robot = await Robot.findById(args.id)
      return robot
    }
  },
  Mutation: {
    createTalk: async (parent, args, { Talk, Robot }) => {
      const talk = await new Talk(args).save()
      talk._id = talk._id.toString()
      return talk
    },

    createRobot: async (parent, args, { Talk, Robot }) => {
      const robot = await new Robot(args).save()
      robot._id = robot._id.toString()
      return robot
    },
    upvoteTalk: async (parent, args, { Talk, Robot }) => {
      const talk = await Talk.findById(args.id)
      talk.set({ votes: talk.votes ? talk.votes + 1 : 1 })
      await talk.save()
      return talk
    }
  }
}
