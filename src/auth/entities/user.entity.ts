import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop({ type: [String], default: ["user"] })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
