package backend.main.backend.models;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessage {
    public String content;
    public String sender;
    public MessageType type;
}
