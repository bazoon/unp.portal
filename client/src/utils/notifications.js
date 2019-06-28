import React from "react";
import { Link } from "react-router-dom";

function formatContent(content) {
  return <>&laquo;{content}&raquo;</>;
}

function createLink(entity, entityId, content) {
  const formattedContent = formatContent(content);
  const links = {
    group: (
      <Link key={content} to={`/groups/${entityId}`}>
        {formattedContent}
      </Link>
    ),
    event: (
      <Link key={content} to={`/events/${entityId}`}>
        {formattedContent}
      </Link>
    ),
    user: (
      <Link key={content} to={`/admin/users/view/${entityId}`}>
        {formattedContent}
      </Link>
    ),
    file: () => {
      return (
        <a className="notification__file" key={entityId} href={entityId}>
          {content}
        </a>
      );
    },
    file_removed: (
      <span key={content} className="notification__file">
        {content}
      </span>
    ),
    conversation: () => {
      const [groupId, conversationId] = entityId.split("-");
      return (
        <Link
          key={entityId}
          to={`/groups/${groupId}/conversations/${conversationId}`}
        >
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

    return parts.filter(Boolean).map(part => {
      const tagMatch = part.match(re);
      if (tagMatch) {
        const [_, content, entity, entityId] = tagMatch;
        return createLink(entity, entityId, content);
      }

      return <span key={part}>{part}</span>;
    });
  }
};
