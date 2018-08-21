CREATE TABLE Users (
	UserId STRING(128) NOT NULL,      -- 適当に見栄えのよいUUID likeな何か
) PRIMARY KEY (UserId)

CREATE TABLE UserAliases (
	UserId STRING(128) NOT NULL,
  Provider STRING(128) NOT NULL,    -- twitter とかそういうやつ
  Identifier STRING(128) NOT NULL,  -- 100200300 とかそういうやつ
) PRIMARY KEY (UserId, Provider, Identifier)
