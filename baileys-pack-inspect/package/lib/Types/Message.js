import { proto } from '../../WAProto/index.js';
// export the WAMessage Prototypes
export { proto as WAProto };
export const WAMessageStubType = proto.WebMessageInfo.StubType;
export const WAMessageStatus = proto.WebMessageInfo.Status;
/** Convenience aliases for commonly-used proto enums — same values as
 *  e.g. `WAProto.Message.ButtonsMessage.HeaderType`, just shorter to type. */
export const ButtonHeaderType = proto.Message.ButtonsMessage.HeaderType;
export const ButtonType = proto.Message.ButtonsMessage.Button.Type;
export const CarouselCardType = proto.Message.InteractiveMessage.CarouselMessage.CarouselCardType;
export const ProtocolType = proto.Message.ProtocolMessage.Type;
export var WAMessageAddressingMode;
(function (WAMessageAddressingMode) {
    WAMessageAddressingMode["PN"] = "pn";
    WAMessageAddressingMode["LID"] = "lid";
})(WAMessageAddressingMode || (WAMessageAddressingMode = {}));
//# sourceMappingURL=Message.js.map