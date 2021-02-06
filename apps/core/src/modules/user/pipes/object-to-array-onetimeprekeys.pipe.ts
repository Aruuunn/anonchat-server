import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ObjectToArrayOnetimeprekeysPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      if (
        typeof value !== 'undefined' &&
        typeof value.oneTimePreKeys === 'object'
      ) {
        value.oneTimePreKeys = Object.values(value.oneTimePreKeys);
      }
    } catch (e) {
      throw new BadRequestException();
    }

    return value;
  }
}
