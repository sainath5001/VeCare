import { TELEGRAM_URL } from "../../../const";
import { Button, Link, Text } from "@chakra-ui/react";
import { FaTelegram } from "react-icons/fa6";

export const TelegramButton: React.FC = () => {
  return (
    <Link href={TELEGRAM_URL} isExternal>
      <Button
        onClick={() => {}}
        leftIcon={<FaTelegram size={24} />}
        textColor={"white"}
        bgColor={"social.telegram"}
        _hover={{ bg: "social.telegramHover" }}
        borderRadius={22}
      >
        <Text fontWeight={500} fontSize="16px" lineHeight="19px">
          Join Telegram
        </Text>
      </Button>
    </Link>
  );
};
