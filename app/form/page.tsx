"use client";

import { useForm } from "@mantine/form";
import { TextInput, Textarea, Button, Group, Stack } from "@mantine/core";

export default function FormPage() {
  const form = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    },
    validate: {
      firstName: (v) => (v.trim() ? null : "First name is required"),
      lastName: (v) => (v.trim() ? null : "Last name is required"),
      email: (v) =>
        /\S+@\S+\.\S+/.test(v) ? null : "Please enter a valid email",
      phone: (v) => (v.trim() ? null : "Phone number is required"),
      message: (v) => (v.trim() ? null : "Message is required"),
    },
  });

  const onSubmit = (values: typeof form.values) => {
    //  “datetime”, saatmise hetkel
    const payload = {
      ...values,
      datetime: new Date().toISOString(), // või submittedAt: ...
    };

    console.log("Form data:", payload);
    alert("Form is valid and submitted");
  };

  return (
    <Stack maw={420} mx="auto" mt="xl" p="md">
      <h2>Booking Form</h2>
      <form onSubmit={form.onSubmit(onSubmit)} noValidate>
        <TextInput
          withAsterisk
          label="First Name"
          {...form.getInputProps("firstName")}
        />
        <TextInput
          withAsterisk
          label="Last Name"
          {...form.getInputProps("lastName")}
        />
        <TextInput
          withAsterisk
          label="Email"
          type="email"
          {...form.getInputProps("email")}
        />
        <TextInput
          withAsterisk
          label="Phone Number"
          {...form.getInputProps("phone")}
        />
        <Textarea
          withAsterisk
          label="Message"
          minRows={3}
          {...form.getInputProps("message")}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Stack>
  );
}
