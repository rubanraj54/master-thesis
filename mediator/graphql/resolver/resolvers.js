import GraphQLJSON from 'graphql-type-json';

import {
    GraphQLDate,
    GraphQLTime,
    GraphQLDateTime
  } from 'graphql-iso-date';

import Query from '../graphqlschemas/newqueries'
import Mutation from '../graphqlschemas/newmutations'

export default {
    JSON: GraphQLJSON,
    DateTime: GraphQLDateTime,
    Query,
    Mutation
}
