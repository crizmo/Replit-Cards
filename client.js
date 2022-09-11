import { gql, GraphQLClient } from 'graphql-request';
const client = new GraphQLClient('https://replit.com/graphql', {});

client.setHeaders({
    'X-Requested-With': 'whois-cli (replit/@kurizu)',
    'User-Agent': 'whois-cli (replit/@kurizu)',
    referrer: 'https://replit.com/',
    origin: 'https://replit.com',
});

export const getData = async (username) => {
    let query = gql`
    query {
        userByUsername(username: "${username}") {
        id username firstName lastName bio isVerified timeCreated
        }
      }
  `;

    const r = await client.request(query, { username });
    return r;
};