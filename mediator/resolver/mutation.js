export default {
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