import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { TeamRole } from '@incidentops/shared';

import { AddMemberDto, CreateTeamDto, UpdateMemberDto } from './dto/team.dto';
import { Team, TeamDocument } from './schemas/team.schema';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private teamModel: Model<TeamDocument>) {}

  async create(createTeamDto: CreateTeamDto, creatorId: string): Promise<Team> {
    const team = new this.teamModel({
      ...createTeamDto,
      members: [
        {
          user: new Types.ObjectId(creatorId),
          role: TeamRole.OWNER,
          joinedAt: new Date(),
          isAvailable: true,
        },
      ],
    });
    return team.save();
  }

  async findAll(): Promise<Team[]> {
    return this.teamModel.find().populate('members.user', 'name email avatar').exec();
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamModel
      .findById(id)
      .populate('members.user', 'name email avatar role isVerified')
      .exec();
    if (!team) throw new NotFoundException(`Team #${id} not found`);
    return team;
  }

  async update(id: string, updateDto: Partial<CreateTeamDto>): Promise<Team> {
    const team = await this.teamModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!team) throw new NotFoundException(`Team #${id} not found`);
    return team;
  }

  async remove(id: string): Promise<void> {
    const result = await this.teamModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`Team #${id} not found`);
  }

  async addMember(teamId: string, addMemberDto: AddMemberDto): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) throw new NotFoundException(`Team #${teamId} not found`);

    let targetUserId = addMemberDto.userId.trim();
    if (targetUserId.includes('@')) {
      const user = await this.teamModel.db
        .collection('users')
        .findOne({ email: targetUserId.toLowerCase() });
      if (!user) {
        throw new NotFoundException(`User with email "${targetUserId}" not found`);
      }
      targetUserId = user._id.toString();
    }

    const alreadyMember = team.members.some((m) => m.user.toString() === targetUserId);
    if (alreadyMember) throw new ConflictException('User is already a member of this team');

    team.members.push({
      user: new Types.ObjectId(targetUserId) as any,
      role: addMemberDto.role ?? TeamRole.MEMBER,
      joinedAt: new Date(),
      isAvailable: true,
    });
    await team.save();
    return team.populate('members.user', 'name email avatar');
  }

  async updateMember(
    teamId: string,
    userId: string,
    updateMemberDto: UpdateMemberDto,
  ): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) throw new NotFoundException(`Team #${teamId} not found`);

    const member = team.members.find((m) => m.user.toString() === userId);
    if (!member) throw new NotFoundException(`User ${userId} is not a member of this team`);

    if (updateMemberDto.role !== undefined) member.role = updateMemberDto.role;
    if (updateMemberDto.isAvailable !== undefined) member.isAvailable = updateMemberDto.isAvailable;

    await team.save();
    return team.populate('members.user', 'name email avatar');
  }

  async removeMember(teamId: string, userId: string): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) throw new NotFoundException(`Team #${teamId} not found`);

    const idx = team.members.findIndex((m) => m.user.toString() === userId);
    if (idx === -1) throw new NotFoundException(`User ${userId} is not a member of this team`);

    team.members.splice(idx, 1);
    await team.save();
    return team;
  }
}
