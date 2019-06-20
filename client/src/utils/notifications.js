import React from "react";
import { Link } from "react-router-dom";

function formatContent(content) {
  return <>&laquo;{content}&raquo;</>;
}

function createLink(entity, entityId, content) {
  const formattedContent = formatContent(content);
  const links = {
    group: <Link to={`/groups/${entityId}`}>{formattedContent}</Link>,
    event: <Link to={`/events/${entityId}`}>{formattedContent}</Link>,
    user: <Link to={`/users/view/${entityId}`}>{formattedContent}</Link>,
    conversation: () => {
      const [groupId, conversationId] = entityId.split("-");
      return (
        <Link to={`/groups/${groupId}/conversations/${conversationId}`}>
          {formattedContent}
        </Link>
      );
    }
  };

  const link = links[entity];

  return typeof link === "function" ? link() : link;

  return links[entity];
}

export default {
  format: text => {
    const parts = text.split("#");
    const re = /(.+):(\w+):(.+)/;

    return parts.map(part => {
      const tagMatch = part.match(re);
      if (tagMatch) {
        const [_, content, entity, entityId] = tagMatch;
        return createLink(entity, entityId, content);
      }
      return <span>{part}</span>;
    });
  }
};
