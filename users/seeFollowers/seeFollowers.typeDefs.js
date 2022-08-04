import { gql } from 'apollo-server-express';

export default gql`
  type seeFollowersQuery {
    ok: Boolean!
    error: String
    followers: [User]
    totalPages: Int
  }
  type Query {
    seeFollowers(username: String!, page: Int!): seeFollowersQuery!
  }
`;
