import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as efs from 'aws-cdk-lib/aws-efs';
import {NestedStack, NestedStackProps} from "aws-cdk-lib";


export interface EFSStackProps extends NestedStackProps {
    vpc: ec2.Vpc,
}

export class EFSStack extends NestedStack {

    /**
     *
     * @param {Construct} scope
     * @param {string} id
     * @param {StackProps=} props
     */
    constructor(scope: Construct, id: string, props: EFSStackProps) {
        super(scope, id, props);
        // 创建安全组
        const vpc = props.vpc
        const securityGroup = new ec2.SecurityGroup(this, 'ComfyUIEfsSecurityGroup', {
            vpc,
            allowAllOutbound: true,
            securityGroupName: 'ComfyUIEfsSecurityGroup',
        });
  
        // 允许 NFS 连接
        securityGroup.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(2049), 'Allow NFS Connections');
    
        // 创建 EFS 文件系统
        const fileSystem = new efs.FileSystem(this, 'ComfyUIEfsFileSystem', {
            vpc,
            securityGroup,
            encrypted: true, // 启用加密
            performanceMode: efs.PerformanceMode.GENERAL_PURPOSE, // 性能模式
            throughputMode: efs.ThroughputMode.BURSTING, // 吞吐模式
        });
    
        // 创建访问点
        const accessPoint = fileSystem.addAccessPoint('MyAccessPoint', {
            path: '/comfyui',
            createAcl: {
                ownerGid: '1000',
                ownerUid: '1000',
                permissions: '755',
            },
            posixUser: {
                gid: '1000',
                uid: '1000',
            },
        });
    }

}