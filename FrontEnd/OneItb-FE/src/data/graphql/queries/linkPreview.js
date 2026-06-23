import { gql } from '@apollo/client';

export const GET_LINK_PREVIEW = gql`
  query LinkPreview($url: String!) {
    linkPreview(url: $url) {
      success
      title
      description
      imageUrl
      originalUrl
      domain
    }
  }
`;
