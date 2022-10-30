import {
    ConflictException,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
// import bcrypt from 'bcrypt';
const bcrypt = require('bcrypt');

import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}


  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;

    try {
        // const user = await this.usersRepository.findOne({ username });
        const user = await this.usersRepository.findOneByOrFail({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
          const payload = { username };
          const accessToken: string = await this.jwtService.sign(payload);
          return { accessToken };
        } else {
          throw new UnauthorizedException('Please check your login credentials');
        }
    }
    catch(err)
    {
        throw err;
    }
  }



      async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialsDto;

        // cant tell if 2 ppl share same pwd and craking one can't crack many - but still hacker can bruteforce so add pepper for more security - we dont have to store salt to database in bcrypt
        const salt = await bcrypt.genSalt();
        // const pepper = "kali_mirch";
        const hashedPassword = await bcrypt.hash(password, salt);
        // const hashedPassword = password;

        const user = this.usersRepository.create({ username, password: hashedPassword });

        try {
            //fuck u typeorm https://stackoverflow.com/a/68146851/11612599 problably another update
          // await this.usersRepository.save(user);
          await this.usersRepository.insert(user);
        } catch (error) {
            console.log(error.code);
          if (error.code === 'ER_DUP_ENTRY') {
            // duplicate username
            throw new ConflictException('Username already exists');
          } else {
            throw new InternalServerErrorException();
          }
        }
      }
}
