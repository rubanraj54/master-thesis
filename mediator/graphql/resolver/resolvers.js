import GraphQLJSON from 'graphql-type-json';

// import Query from './query'
// import Mutation from './mutation'
import Query from '../graphqlschemas/newqueries'
import Mutation from '../graphqlschemas/newmutations'

export default {
    JSON: GraphQLJSON,
    Query,
    Mutation
}
