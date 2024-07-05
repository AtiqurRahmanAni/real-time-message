import MessageSendButton from "./MessageSendButton";

const Inbox = () => {
  return (
    <div className="relative flex-1 h-full min-h-[calc(100dvh-4.45rem)] ml-4">
      <div className="absolute bottom-0 w-full">
        <div className="relative">
          <div>
            <textarea
              className="pl-4 py-4 pr-14 w-full text-gray-500 bg-gray-200 rounded-md focus:outline-gray-300"
              rows={2}
              maxLength={150}
            />
          </div>
          <div className="absolute bottom-1/2 translate-y-1/2 right-2">
            <MessageSendButton onClick={() => console.log("Hello")} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
