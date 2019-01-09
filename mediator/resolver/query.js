export default {
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
  }