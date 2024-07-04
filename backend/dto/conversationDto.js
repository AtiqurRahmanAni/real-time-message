class ConversationDto {
  _id;
  participants;
  lastMessage;
  lastMessageTimestamp;

  constructor(conversation) {
    this._id = conversation._id;
    this.participants = conversation.participants;
    this.lastMessage = conversation.lastMessage;
    this.lastMessageTimestamp = conversation.lastMessageTimestamp;
  }
}

export default ConversationDto;
