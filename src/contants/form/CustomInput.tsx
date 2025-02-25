import { COLORS } from "@/components/utils/theme";
import {
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Select,
    Text,
    Textarea,
} from "@chakra-ui/react";
import { Field } from "formik";
import React, { useState } from "react";

function CustomInput({
    fieldProps = {},
    label,
    name,
    type = "input",
    children,
    value,
    float = false,
    placeholder,
}: any) {
    const [touched, setTouched] = useState(false);
    const transitionProperties = {
        transitionProperty: "all",
        transitionDuration: "0.2s",
        transitionTimingFunction: "ease-in-out",
    };

    const pickFormField = ({ fieldType, options = {} }: any) => {
        switch (fieldType) {
            case "textarea":
                return (
                    <Textarea
                        position="relative"
                        onFocus={() => setTouched(true)}
                        id={name}
                        name={name}
                        bg="#F1F2F3"
                       placeholder={placeholder?placeholder:""}
                        borderWidth="none"
                        borderColor="transparent"
                        {...options}
                    ></Textarea>
                );
            case "select":
                return (
                    <Select
                        id={name}
                        name={name}
                        bg="#F1F2F3"
                        borderWidth="none"
                        borderColor="transparent"
                        {...options}
                    >
                        {children}
                    </Select>
                );

            default:
                return (
                    <Input
                        position="relative"
                        onFocus={() => setTouched(true)}
                        id={name}
                        name={name}
                        placeholder={placeholder?placeholder:""}
                        size="lg"
                        bg="#F1F2F3"
                        borderWidth="none"
                        borderColor="transparent"
                        value={value}
                        {...options}
                    />
                );
        }
    };

    return (
        <>
            <Field name={name}>
                {({ field, form }:any) => {
                    const isInvalid = form.errors[name] && form.touched[name];
                    return (
                        <FormControl
                            isInvalid={isInvalid}
                            mt={touched || field.value ? "2" : "0"}
                        >
                            {label && (
                                <FormLabel
                                    {...transitionProperties}
                                    pointerEvents="none"
                                    ml={"-2"}
                                    bg={float ? "#F1F2F3" : "transparent"}
                                    rounded="md"
                                    px="2"
                                    zIndex="2"
                                    mb="1"
                                    fontSize="20px"
                                    mt="12px"
                                    color={isInvalid ? "red" : COLORS.gray}
                                    borderColor={isInvalid && touched ? "red" : "transparent"}
                                    borderWidth={float ? "thin" : "none"}
                                >
                                    {label}
                                </FormLabel>
                            )}
                            {pickFormField({
                                fieldType: type,
                                options: { ...field, ...fieldProps },
                            })}

                            <FormErrorMessage fontSize="xs" lineHeight="none">
                                {form.errors[name]}
                            </FormErrorMessage>
                        </FormControl>
                    );
                }}
            </Field>
        </>
    );
}

export default CustomInput;